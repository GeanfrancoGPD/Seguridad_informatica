import React, { useState, useMemo, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import SelectInput from "ink-select-input";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import { ProTable } from "./table.js";
import TextInput from "ink-text-input";
import { Form } from "./Form.js";

export function MainLayout({ children }) {
  return <Box>{children}</Box>;
}

export function SideBar({ navItem, onSelect, focus }) {
  const isFocused = focus === "sidebar";
  if (!isFocused) {
    return (
      <Box
        borderStyle="single"
        height="100%"
        width={40}
        borderColor="gray"
        padding={2}
      >
        <Text>Ingrese Tab para seleccionar el menu</Text>
      </Box>
    );
  }
  return (
    <Box
      borderStyle="single"
      height="100%"
      width={40}
      borderColor="green"
      padding={2}
    >
      <SelectInput items={navItem} onSelect={onSelect} />
    </Box>
  );
}

export function Content() {
  return (
    <Box width={"100%"} borderStyle={"single"} height={"100%"}>
      <Text>Im' the content area</Text>
    </Box>
  );
}

export function ContentPaneOne({ isFocused }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(0);
  const [mode, setMode] = useState("nav");
  const [products, setProducts] = useState([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch("http://proxy/app/productos");
        const data = await res.json();
        setProducts(data);
      } catch (e) {
        console.error("Error cargando productos:", e);
      }
    };
    fetchProductos();
  }, []);

  const PAGE_SIZE = 10;
  const data = products.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    precio: p.valor ? `$${p.valor}` : "",
    estado: p.estado_nombre || "",
    fecha: p.fecha_registro || "",
    Nombre_cliente: p.cliente_nombre || "",
  }));

  const filtered = useMemo(() => {
    return data.filter(
      (d) =>
        d.nombre.toLowerCase().includes(query.toLowerCase()) ||
        d.Nombre_cliente.toLowerCase().includes(query.toLowerCase()),
    );
  }, [data, query]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const pageData = filtered.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  useEffect(() => {
    setSelected(0);
    setPage(0);
  }, [query]);

  useEffect(() => {
    if (selected >= pageData.length) setSelected(0);
  }, [page]);

  useInput((input, key) => {
    if (!isFocused) return;
    if (mode === "search") {
      if (key.escape || key.return) {
        setQuery("");
        setMode("nav");
        return;
      }
      if (key.backspace || key.delete) {
        setQuery((prev) => prev.slice(0, -1));
        return;
      }
      if (input) setQuery((prev) => prev + input);
      return;
    }

    if (key.upArrow) setSelected((prev) => (prev > 0 ? prev - 1 : prev));
    if (key.downArrow)
      setSelected((prev) => (prev < pageData.length - 1 ? prev + 1 : prev));
    if (key.leftArrow) setPage((prev) => (prev > 0 ? prev - 1 : prev));
    if (key.rightArrow)
      setPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
    if (input === "/") {
      setMode("search");
      setQuery("");
    }

    // Despachador shortcuts
    if (input === "a") {
      // aceptar -> estado 2 (En tránsito)
      const item = pageData[selected];
      if (item) changeEstado(item.id, 2, "Aceptado por despachador");
    }
    if (input === "d") {
      // denegar -> estado 4 (Devuelto)
      const item = pageData[selected];
      if (item) changeEstado(item.id, 4, "Denegado por despachador");
    }
  });

  const changeEstado = async (id, estado_id, nota) => {
    try {
      const res = await fetch(`http://proxy/app/producto/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_id, nota }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setMensaje("Estado actualizado");
      setTimeout(() => setMensaje(""), 2000);
    } catch (e) {
      console.error("Error cambiando estado:", e);
      setMensaje("Error actualizando estado");
    }
  };

  return (
    <Box
      borderStyle="single"
      height="100%"
      width="100%"
      flexDirection="column"
      paddingLeft={4}
      paddingRight={4}
    >
      <Gradient name="cristal">
        <BigText text="Despacho" />
      </Gradient>
      <Text>Lista de productos para revisar</Text>
      {mensaje && <Text color="green">{mensaje}</Text>}
      <ProTable
        data={pageData}
        selected={selected}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
      />
    </Box>
  );
}

export function ContentPaneTwo() {
  const [mensaje, setMensaje] = useState("");
  const handleSubmit = async (data) => {
    // delegar al servidor de registro (reutiliza ruta de productos)
    try {
      const res = await fetch("http://proxy/app/registrar-producto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, fecha: new Date() }),
      });
      const j = await res.json();
      setMensaje("Registrado: " + (j.data ? j.data.id : "ok"));
      setTimeout(() => setMensaje(""), 3000);
    } catch (e) {
      setMensaje("Error");
    }
  };

  return (
    <Box
      borderStyle="single"
      height="100%"
      width="100%"
      flexDirection="column"
      paddingLeft={4}
      paddingRight={4}
    >
      <Gradient name="cristal">
        <BigText text="Registro" />
      </Gradient>
      <Text>Registro de paquetes</Text>
      {mensaje && <Text color="green">{mensaje}</Text>}
      <Form
        fields={[
          { name: "producto", label: "Nombre del producto" },
          { name: "cliente", label: "Nombre del cliente" },
          { name: "peso", label: "Peso (kg)" },
        ]}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
