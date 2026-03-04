import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import axios from "axios";
import BigText from "ink-big-text";
import ldap from "ldapjs";

const Login = ({ onSuccess, onFail }) => {
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      const client = ldap.createClient({
        url: "ldap://ldap:389",
      });

      const userDN = `uid=${username},ou=employees,dc=envios,dc=local`;

      client.bind(userDN, password, (err) => {
        if (err) {
          onFail();
          setError("Usuario o contraseña incorrecta");
          return;
        }
        console.log("Autenticación correcta");

        const opts = {
          filter: `(member=${userDN})`, // Busca grupos donde el usuario sea miembro
          scope: "sub",
          attributes: ["cn"], // Solo queremos el nombre del grupo
        };

        client.search("ou=roles,dc=envios,dc=local", opts, (err, res) => {
          if (err) {
            console.error("Error en la búsqueda:", err);
            return;
          }

          res.on("searchEntry", (entry) => {
            console.log("Rol del usuario:", entry.object.cn);
            // Por ejemplo: "Mostrador" o "Despacho"
          });

          res.on("end", (result) => {
            console.log("Búsqueda de roles finalizada");
            client.unbind();
          });

          res.on("error", (err) => {
            console.error("Error durante la búsqueda:", err);
          });
        });
        onSuccess({ username, rol: "Mostrador" });
      });
    } catch (err) {
      setError("Error al conectar con el servidor LDAP: " + err.message);
      return;
    }
  };

  useInput((input, key) => {
    if (error && input.toLowerCase() === "r") {
      setUsername("");
      setPassword("");
      setError("");
      setStep(0);
    }
  });

  return (
    <Box
      flexDirection="column"
      padding={1}
      borderStyle="round"
      borderColor="cyan"
    >
      <BigText text="Login" />
      <Box>
        <Text>Nombre: </Text>
        <TextInput
          value={username}
          onChange={setUsername}
          onSubmit={() => setStep(1)}
          focus={step === 0}
        />
      </Box>
      <Box>
        <Text>contraseña: </Text>
        <TextInput
          value={password}
          onChange={setPassword}
          mask="*"
          onSubmit={handleSubmit}
          focus={step === 1}
        />
      </Box>

      {error && <Text color="red">{error} + "presione R para reintentar"</Text>}
    </Box>
  );
};

export default Login;
