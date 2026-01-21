import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import ToastMessage from "./ToastMessage"; // ← IMPORTACIÓN
import "../styles/LoginForm.css";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin();
  };

  const handleLogin = async () => {
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (loginError) {
        console.error("Supabase error:", loginError.message);
        showToast(loginError.message || "Correo o contraseña incorrectos", "error");
        return;
      }

      const userId = data.user.id;

      const { data: perfil, error: perfilError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id_auth", userId)
        .single();

      if (perfilError || !perfil) {
        console.error("Perfil no encontrado:", perfilError);
        showToast("No se encontró el perfil del usuario.", "error");
        return;
      }

      const userInfo = { ...data.user, userType: perfil.user_type };
      localStorage.setItem("user", JSON.stringify(userInfo));

      login(userInfo); // Guarda en el contexto global

      // Redirigir según el tipo de usuario
      switch (perfil.user_type) {
        case "superusuario":
          navigate("/SuperUserDashboard");
          break;
        case "directora":
          navigate("/DirectoraDashboard");
          break;
        case "profesor":
          navigate("/ProfesorDashboard");
          break;
        default:
          navigate("/");
      }

    } catch (error) {
      console.error("Error en el login:", error);
      showToast("Hubo un problema con el servidor.", "error");
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="login-button">
          Iniciar Sesión
        </button>
      </form>

      {/* ToastMessage para mostrar errores o mensajes */}
      {toastMessage && (
        <ToastMessage
          message={toastMessage}
          duration={3000}
          onClose={() => setToastMessage("")}
          type={toastType}
        />
      )}
    </div>
  );
};

export default LoginForm;
