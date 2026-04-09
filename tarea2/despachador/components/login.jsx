import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
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
        url: "ldap://ldap-envios",
        reconnect: true,
      });

      console.log(username, password);

      const userDN = `uid=${username.toLowerCase()},ou=employees,dc=envios,dc=local`;

      client.bind(userDN, password, (err) => {
        if (err) {
          console.log("Bind error:", err);
          setError("Usuario o contraseña incorrecta");
          onFail();
          return;
        }

        console.log("Autenticación correcta");

        const searchBase = "ou=roles,dc=envios,dc=local";
        const roles = [];
        const opts = {
          filter: `(member=${userDN})`,
          scope: "sub",
          attributes: ["cn"],
        };

        console.log("Buscando roles para:", userDN);

        // client.search(searchBase, opts, (err, res) => {
        //   if (err) {
        //     console.error("Error iniciando búsqueda:", err);
        //     client.unbind();
        //     return;
        //   }

        //   res.on("searchEntry", (entry) => {
        //     console.log("Grupo encontrado:", entry.object);
        //     roles.push(entry.object.cn);
        //   });

        //   res.on("error", (err) => {
        //     console.error("Error durante la búsqueda:", err);
        //   });

        //   res.on("end", (result) => {
        //     console.log("Búsqueda finalizada:", result.status);
        //     console.log("Roles:", roles);

        //     onSuccess({
        //       username,
        //       groups: roles,
        //     });

        //     client.unbind();
        //   });
        // });

        onSuccess({
          username,
          rol: "Despachador",
        });
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

      {error && <Text color="red">{error} presione R para reintentar</Text>}
    </Box>
  );
};

export default Login;
