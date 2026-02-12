import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; 
import "./styles/global.css"; 
import "./styles/Navbar.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider> {/* Aquí envuelves la app con AuthProvider */}
      <App />
    </AuthProvider>
  </BrowserRouter>
);