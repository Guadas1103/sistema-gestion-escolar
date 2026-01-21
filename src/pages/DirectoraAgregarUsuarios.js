import React, { useEffect, useState } from "react";
import '../styles/DirectoraAgregarUsuarios.css';
import { supabase } from "../services/supabaseClient";
import ToastMessage from '../components/ToastMessage'; // Ajusta ruta si es necesario
import ConfirmModal from '../components/ConfirmModal'; // Ajusta ruta si es necesario

const DirectoraAgregarUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("profesor");

  const [showModal, setShowModal] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editNombre, setEditNombre] = useState("");
  const [editTipo, setEditTipo] = useState("");
  const [editUserId, setEditUserId] = useState(null);

  // Estados para ConfirmModal y ToastMessage
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

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
      setToast({ show: true, message: "Completa todos los campos", type: "error" });
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
    fetchUsuarios();
    setToast({ show: true, message: "Usuario creado correctamente", type: "success" });
  };

  // Abre confirmación de eliminación
  const abrirConfirmEliminar = (user) => {
    setUsuarioAEliminar(user);
    setConfirmOpen(true);
  };

  // Confirmar eliminación
  const confirmarEliminar = async () => {
    if (!usuarioAEliminar) return;

    setConfirmOpen(false);

    const userId = usuarioAEliminar.id_auth;

    const { error } = await supabase.from("usuarios").delete().eq("id_auth", userId);

    if (error) {
      setToast({ show: true, message: "Error al eliminar usuario: " + error.message, type: "error" });
    } else {
      setToast({ show: true, message: "Usuario eliminado correctamente", type: "success" });
      fetchUsuarios();
    }

    setUsuarioAEliminar(null);
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
    <div className="directora-usuarios-container">
      <h1>Agregar Nuevos Usuarios</h1>

      <form className="user-form" onSubmit={handleCrearUsuario}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Contraseña</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

        <label>Nombre</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

        <label>Tipo de Usuario</label>
        <select value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)}>
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
                  <button className="btn btn-small" onClick={() => abrirConfirmEliminar(user)}>Eliminar</button>
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
              <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} />

              <label>Tipo de Usuario</label>
              <select value={editTipo} onChange={(e) => setEditTipo(e.target.value)}>
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

      {/* ConfirmModal para confirmar eliminación */}
      <ConfirmModal
        isOpen={confirmOpen}
        message="¿Seguro que quieres eliminar este usuario?"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* ToastMessage para notificaciones */}
      {toast.show && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default DirectoraAgregarUsuarios;
