import dotenv from "dotenv";
import React from "react";
import { render } from "ink";
import Login from "./components/login.jsx";
import Home from "./components/home.jsx";

dotenv.config();

const App = () => {
  const [screen, setScreen] = React.useState("login");
  const [user, setUser] = React.useState(null);

  if (screen === "login") {
    return (
      <Login
        onSuccess={(userData) => {
          setUser(userData);
          setScreen("home");
        }}
        onFail={() => setScreen("login")}
      />
    );
  }

  if (screen === "home") return <Home user={user} />;

  return null;
};

render(<App />);
