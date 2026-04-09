import React, { useEffect, useMemo, useState } from "react";
import { Box, Text, useInput } from "ink";
import SelectInput from "ink-select-input";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import { Form } from "./Form.jsx";
import { ProTable } from "./table.jsx";

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
        <Text>Presiona Tab para enfocar el menu</Text>
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
    <Box width={"100%"}>
      <Text>Content</Text>
    </Box>
  );
}

export function ContentPaneOne({ isFocused }) {
  const [quejas, setQuejas] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState(0);
  const [mode, setMode] = useState("nav");

  useEffect(() => {
    const fetchQuejas = async () => {
      try {
        const res = await fetch("http://proxy/app/quejas");
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        setQuejas(data);
      } catch (error) {
        console.error("Error cargando quejas:", error);
        setQuejas([]);
      }
    };

    fetchQuejas();
  }, []);

  const PAGE_SIZE = 10;

  const data = quejas.map((q) => ({
    id: q.id,
    cliente_id: q.cliente_id ?? "",
    cliente_nombre: q.cliente_nombre || "",
    producto_id: q.producto_id ?? "",
    producto_nombre: q.producto_nombre || "",
    descripcion: q.descripcion || "",
    estado: q.estado || "",
    creado: q.creado || "",
  }));

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter(
      (item) =>
        String(item.id).toLowerCase().includes(q) ||
        String(item.cliente_id).toLowerCase().includes(q) ||
        item.cliente_nombre.toLowerCase().includes(q) ||
        String(item.producto_id).toLowerCase().includes(q) ||
        item.producto_nombre.toLowerCase().includes(q) ||
        item.descripcion.toLowerCase().includes(q) ||
        item.estado.toLowerCase().includes(q),
    );
  }, [data, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
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
  }, [pageData.length, selected]);

  useInput((input, key) => {
    if (!isFocused) return;

    if (mode === "search") {
      if (key.escape || key.return) {
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
  });

  return (
    <Box
      borderStyle="single"
      height="100%"
      width="100%"
      flexDirection="column"
      paddingLeft={3}
      paddingRight={3}
    >
      <Gradient name="cristal">
        <BigText text="Quejas" />
      </Gradient>
      <Text>Listado completo de quejas</Text>

      <Box marginBottom={1}>
        <Text color={mode === "search" ? "cyan" : "gray"}>
          {mode === "search" ? "Buscando: " : "Presiona [/] para buscar: "}
          <Text bold color="white">
            {query}
          </Text>
        </Text>
      </Box>

      {filtered.length === 0 ? (
        <Text>No hay quejas para mostrar</Text>
      ) : (
        <ProTable
          data={pageData}
          selected={selected}
          page={page}
          totalPages={totalPages}
          pageSize={PAGE_SIZE}
        />
      )}
    </Box>
  );
}

export function ContentPaneTwo() {
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (data) => {
    try {
      const res = await fetch("http://proxy/app/queja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_id: data.cliente_id ? Number(data.cliente_id) : null,
          producto_id: data.producto_id ? Number(data.producto_id) : null,
          descripcion: data.descripcion,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al registrar queja");
      }

      const j = await res.json();
      setMensaje("Queja registrada: " + j.data.id);
      setTimeout(() => setMensaje(""), 3000);
    } catch (e) {
      setMensaje("Error: " + e.message);
    }
  };

  return (
    <Box
      borderStyle="single"
      height="100%"
      width="100%"
      flexDirection="column"
      paddingLeft={3}
      paddingRight={3}
    >
      <Gradient name="cristal">
        <BigText text="Registrar" />
      </Gradient>
      <Text>Registrar queja</Text>
      {mensaje && (
        <Text color={mensaje.startsWith("Error") ? "red" : "green"}>
          {mensaje}
        </Text>
      )}
      <Form
        fields={[
          { name: "cliente_id", label: "Cliente ID (opcional)" },
          { name: "producto_id", label: "Producto ID (opcional)" },
          { name: "descripcion", label: "Descripción" },
        ]}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
