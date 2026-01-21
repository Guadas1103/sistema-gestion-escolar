import React, { useEffect, useState } from "react";
import '../styles/SuperUserGestionarUsuarios.css';
import { supabase } from "../services/supabaseClient";
import ToastMessage from "../components/ToastMessage"; // Ajusta ruta si es necesario
import ConfirmModal from "../components/ConfirmModal"; // Ajusta ruta si es necesario

const SuperUserGestionarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para formulario de creación
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("profesor");

  // Estados para formulario de edición
  const [showModal, setShowModal] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editTipo, setEditTipo] = useState("");
  const [editUserId, setEditUserId] = useState(null);

  // Estados para ToastMessage
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  // Estados para ConfirmModal (eliminar usuario)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("usuarios").select("*");

    if (error) {
      setToast({ show: true, message: "Error al cargar usuarios: " + error.message, type: "error" });
    } else {
      setUsuarios(data);
    }

    setLoading(false);
  };

  const handleCrearUsuario = async (e) => {
    e.preventDefault();

    if (!email || !password || !nombre) {
      setToast({ show: true, message: "Completa todos los campos", type: "warning" });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (signUpError) {
      setToast({ show: true, message: "Error al crear usuario: " + signUpError.message, type: "error" });
      return;
    }

    if (!data || !data.user) {
      setToast({ show: true, message: "No se pudo obtener el ID del nuevo usuario.", type: "error" });
      console.error("Respuesta inesperada de signUp:", data);
      return;
    }

    const userId = data.user.id;

    const { error: insertError } = await supabase.from("usuarios").insert([
      {
        id_auth: userId,
        email: cleanEmail,
        nombre,
        user_type: tipoUsuario,
      },
    ]);

    if (insertError) {
      setToast({ show: true, message: "Error al guardar datos del usuario: " + insertError.message, type: "error" });
      return;
    }

    setEmail("");
    setPassword("");
    setNombre("");
    setTipoUsuario("profesor");
    setToast({ show: true, message: "Usuario creado exitosamente", type: "success" });
    fetchUsuarios();
  };

  // Abrir modal de confirmación para eliminar usuario
  const handleConfirmEliminarUsuario = (userId) => {
    setUserToDelete(userId);
    setConfirmOpen(true);
  };

  // Confirmación de eliminar usuario
  const handleEliminarUsuario = async () => {
    setConfirmOpen(false);

    const { error } = await supabase.from("usuarios").delete().eq("id_auth", userToDelete);

    if (error) {
      setToast({ show: true, message: "Error al eliminar usuario: " + error.message, type: "error" });
      return;
    }

    setToast({ show: true, message: "Usuario eliminado correctamente", type: "success" });
    fetchUsuarios();
  };

  const handleAbrirModal = (user) => {
    setEditUserId(user.id_auth);
    setEditEmail(user.email);
    setEditNombre(user.nombre);
    setEditTipo(user.user_type);
    setShowModal(true);
  };

  const handleGuardarCambios = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("usuarios")
      .update({ nombre: editNombre, user_type: editTipo })
      .eq("id_auth", editUserId);

    if (error) {
      setToast({ show: true, message: "Error al actualizar usuario: " + error.message, type: "error" });
    } else {
      setToast({ show: true, message: "Usuario actualizado", type: "success" });
      setShowModal(false);
      fetchUsuarios();
    }
  };

  return (
    <div className="superuser-usuarios-container">
      <h1>Gestionar Usuarios</h1>

      <form className="user-form" onSubmit={handleCrearUsuario}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <label>Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <label>Tipo de Usuario</label>
        <select
          value={tipoUsuario}
          onChange={(e) => setTipoUsuario(e.target.value)}
        >
          <option value="profesor">Profesor</option>
          <option value="superuser">Super Usuario</option>
          <option value="directora">Directora</option>
        </select>

        <button type="submit" className="btn">Crear Usuario</button>
      </form>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id_auth}>
                <td>{user.email}</td>
                <td>{user.nombre}</td>
                <td>{user.user_type}</td>
                <td>
                  <button className="btn btn-small" onClick={() => handleAbrirModal(user)}>Editar</button>
                  <button className="btn btn-small" onClick={() => handleConfirmEliminarUsuario(user.id_auth)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Editar Usuario</h2>
            <form onSubmit={handleGuardarCambios}>
              <label>Email (no editable)</label>
              <input type="email" value={editEmail} disabled />

              <label>Nombre</label>
              <input
                type="text"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
              />

              <label>Tipo de Usuario</label>
              <select
                value={editTipo}
                onChange={(e) => setEditTipo(e.target.value)}
              >
                <option value="profesor">Profesor</option>
                <option value="superuser">Super Usuario</option>
                <option value="directora">Directora</option>
              </select>

              <div className="modal-buttons">
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ToastMessage para mostrar mensajes */}
      {toast.show && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* ConfirmModal para confirmar eliminación */}
      {confirmOpen && (
        <ConfirmModal
          isOpen={confirmOpen}
          message="¿Seguro que quieres eliminar este usuario?"
          onConfirm={handleEliminarUsuario}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default SuperUserGestionarUsuarios;
