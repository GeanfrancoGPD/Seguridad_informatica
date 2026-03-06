import React, { useState } from "react";
import { Box, Text } from "ink";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import { Form } from "./Form.js";

export function MainLayout({ children }) {
  return <Box>{children}</Box>;
}

export function SideBar({ navItem, onSelect, focus }) {
  const isFocused = focus === "sidebar";
  if (!isFocused)
    return (
      <Box borderStyle="single" height="100%" width={40}>
        <Text>Presiona Tab</Text>
      </Box>
    );
  return (
    <Box borderStyle="single" height="100%" width={40} borderColor="green">
      <Text>Menu</Text>
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

export function ContentPaneOne() {
  // listado sencillo de quejas (puede ampliarse)
  const [quejas, setQuejas] = useState([]);
  React.useEffect(() => {
    fetch("http://proxy/app/quejas")
      .then((r) => r.json())
      .then(setQuejas)
      .catch(() => {});
  }, []);

  return (
    <Box borderStyle="single" padding={1} flexDirection="column">
      <Gradient name="cristal">
        <BigText text="Quejas" />
      </Gradient>
      {quejas.length === 0 ? (
        <Text>No hay quejas</Text>
      ) : (
        quejas.map((q) => (
          <Text key={q.id}>
            {q.id} - {q.descripcion}
          </Text>
        ))
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
        body: JSON.stringify(data),
      });
      const j = await res.json();
      setMensaje("Queja registrada: " + j.data.id);
    } catch (e) {
      setMensaje("Error");
    }
  };

  return (
    <Box borderStyle="single" padding={1} flexDirection="column">
      <Gradient name="cristal">
        <BigText text="Registrar" />
      </Gradient>
      <Text>Registrar queja</Text>
      {mensaje && <Text>{mensaje}</Text>}
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
