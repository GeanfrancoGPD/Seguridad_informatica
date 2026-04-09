import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import {
  MainLayout,
  SideBar,
  Content,
  ContentPaneOne,
  ContentPaneTwo,
} from "./context.jsx";

let sideBarPron = {
  navItem: [
    { label: "Ver quejas", value: "pane_one" },
    { label: "Registrar Queja", value: "pane_two" },
  ],
};

const Home = ({ user }) => {
  const [selectedPanel, setSelectedPanel] = useState("pane_one");
  const [focus, setFocus] = useState("sidebar");

  useInput((input, key) => {
    if (key.tab)
      setFocus((prev) => (prev === "sidebar" ? "content" : "sidebar"));
  });

  if (!user) return <Text>Cargando usuario...</Text>;

  const navegar = (item) => setSelectedPanel(item.value);

  let PanelContent;
  if (selectedPanel === "pane_one")
    PanelContent = <ContentPaneOne isFocused={focus === "content"} />;
  else if (selectedPanel === "pane_two") PanelContent = <ContentPaneTwo />;
  else PanelContent = <Text>Saliendo...</Text>;

  if (user.rol === "Atencion_cliente") {
    return (
      <MainLayout>
        <SideBar {...sideBarPron} onSelect={navegar} focus={focus} />
        {PanelContent}
      </MainLayout>
    );
  }

  return <Text>Acceso no autorizado para el rol: {user.rol}</Text>;
};

export default Home;
