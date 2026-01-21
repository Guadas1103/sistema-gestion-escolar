import React, { useContext, useState } from "react";
import LoginForm from "../components/LoginForm";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ToastMessage from "../components/ToastMessage";  // Importar
import "../styles/LoginBackground.css"; // Fondo animado
import "../styles/LoginForm.css"; // Estilos del login (glassmorphism)

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estado para toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' o 'error'

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
  };

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`http://localhost:5000/users?email=${email}&password=${password}`);
      const users = await response.json();

      if (users.length > 0) {
        const user = users[0];
        login(user);  // Actualiza contexto y localStorage

        // Redirige según tipo de usuario
        switch (user.userType) {
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

        showToast("Login exitoso", "success");
        console.log("Login exitoso:", user);
      } else {
        showToast("Correo o contraseña incorrectos", "error");
        console.log("Correo o contraseña incorrectos");
      }
    } catch (error) {
      showToast("Error en el servidor", "error");
      console.error("Error en el login", error);
    }
  };

  return (
    <div className="login-bg">
      <LoginForm onLogin={handleLogin} />
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

export default Login;
