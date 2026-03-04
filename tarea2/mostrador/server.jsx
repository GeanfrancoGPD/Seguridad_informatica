import dotenv from "dotenv";
import React, { useState, useEffect } from "react";
import { render, Box, Text, useInput } from "ink";
import BigText from "ink-big-text";
import Login from "./components/login";
import Home from "./components/home";

dotenv.config();

const options = ["Iniciar", "saludar", "ver mensajes", "Salir"];

const App = () => {
  // const [selected, setSelected] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);

  const saludar = async () => {
    try {
      const peticion = await fetch("http://localhost:5000/saludar");
      const data = await peticion.json();
      setMensaje(data.mensaje);
    } catch (error) {
      console.error("Error al saludar:", error);
    }
  };

  if (screen === "login") {
    return (
      <Login
        onSuccess={(userData) => {
          setUser(userData);
          setScreen("home");
        }}
        onFail={() => setScreen("login")}
      ></Login>
    );
  }
  if (screen === "home") {
    return <Home user={user}></Home>;
  }
};

render(<App />);
