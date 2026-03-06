import React from "react";
import { Box, Text } from "ink";
import SelectInput from "ink-select-input";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import { ProTable } from "./table";
import { useState, useMemo, useEffect } from "react";
import { useInput } from "ink";
import TextInput from "ink-text-input";
import { Form } from "./Form";

export function MainLayout({ children }) {
  return <Box>{children}</Box>;
}

export function SideBar({ navItem, onSelect, focus }) {
  const isFocused = focus === "sidebar";

  if (!isFocused) {
    // Renderizas solo el contenedor, sin SelectInput
    return (
      <Box
        borderStyle="single"
        height="100%"
        width={40}
        borderColor="gray"
        paddingTop={1}
        paddingBottom={1}
        paddingLeft={2}
        paddingRight={2}
      >
        <Text>Ingrese Tab para seleccionar el menu</Text>
      </Box>
    );
  }

  // Solo cuando está enfocado montas SelectInput
  return (
    <Box
      borderStyle="single"
      height="100%"
      width={40}
      borderColor="green"
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      paddingRight={2}
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

  const PAGE_SIZE = 10;
  const TOTAL = 100;
  const data = Array.from({ length: TOTAL }, (_, i) => ({
    id: i + 1,
    nombre: `Producto ${i + 1}`,
    precio: `$${(i + 1) * 3}`,
    estado: i % 5 === 0 ? "true" : "false",
    fecha: `2024-09-${(i % 30) + 1}`,
    Nombre_cliente: `Cliente ${i + 1}`,
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
    if (selected >= pageData.length) {
      setSelected(0);
    }
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

      if (input) {
        setQuery((prev) => prev + input);
      }
      return;
    }

    if (key.upArrow) {
      setSelected((prev) => (prev > 0 ? prev - 1 : prev));
    }
    if (key.downArrow) {
      setSelected((prev) => (prev < pageData.length - 1 ? prev + 1 : prev));
    }
    if (key.leftArrow) {
      setPage((prev) => (prev > 0 ? prev - 1 : prev));
    }
    if (key.rightArrow) {
      setPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
    }
    if (input === "/") {
      setMode("search");
      setQuery("");
    }
    if (key.return) {
      const item = pageData[selected];
      console.log("Seleccionaste:", item);
      process.exit();
    }
  });
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
        <BigText text="Lista ñ" />
      </Gradient>
      <Text>Lista de productos</Text>

      <Box marginBottom={1}>
        <Text color={mode === "search" ? "cyan" : "gray"}>
          {mode === "search" ? "Escribiendo: " : "Presiona [/] para buscar: "}
          <Text bold color="white">
            {query}
          </Text>
        </Text>
      </Box>
      <ProTable
        data={pageData}
        selected={selected}
        page={page}
        totalPages={totalPages}
        pageSize={PAGE_SIZE}
        onChange={setQuery}
      />
    </Box>
  );
}

export function ContentPaneTwo() {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [nameClient, setNameClient] = useState("");
  const [fecha, setFecha] = useState("");
  const [peso, setPeso] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Obtener fecha actual al cargar
    const hoy = new Date();
    // Formatear la fecha (ej: DD/MM/YYYY)
    const fechaFormateada = hoy.toLocaleDateString("es-ES");
    setFecha(fechaFormateada);
  }, []);

  const handleSubmit = async (data) => {
    setLoading(true);
    setMensaje("");

    try {
      const resultado = { ...data, fecha: fecha };
      console.log("Enviando registro al servidor:", resultado);

      // Enviar petición al proxy en /api/registrar-producto
      const response = await fetch("http://localhost/api/registrar-producto", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          producto: data.producto,
          cliente: data.cliente,
          peso: data.peso,
          fecha: fecha,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const resultado_api = await response.json();
      setMensaje(
        `✓ Producto registrado exitosamente: ${resultado_api.data.id}`,
      );
      console.log("Respuesta del servidor:", resultado_api);

      // Limpiar el formulario después de 2 segundos
      setTimeout(() => {
        setMensaje("");
      }, 3000);
    } catch (error) {
      console.error("Error al registrar produto:", error);
      setMensaje(`✗ Error al registrar: ${error.message}`);
    } finally {
      setLoading(false);
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
      {mensaje && (
        <Text
          color={mensaje.startsWith("✓") ? "green" : "red"}
          bold
          marginBottom={1}
        >
          {mensaje}
        </Text>
      )}
      {loading && <Text color="yellow">Enviando datos...</Text>}
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

// export function ContentPaneTwo() {
//   return (
//     <Box
//       borderStyle="single"
//       height="100%"
//       width="100%"
//       flexDirection="column"
//       paddingLeft={4}
//       paddingRight={4}
//     >
//       <Gradient name="cristal">
//         <BigText text="Registro" />
//       </Gradient>
//       <Text>I'm the second content area</Text>
//     </Box>
//   );
// }
