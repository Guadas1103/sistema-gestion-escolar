import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import "../styles/DirectoraAsignarGrupos.css";
import ToastMessage from "../components/ToastMessage";
import ConfirmModal from "../components/ConfirmModal";

const DirectoraAsignarGrupos = () => {
  const [profesores, setProfesores] = useState([]);
  const [grados, setGrados] = useState([]);
  const [nombreGrupo, setNombreGrupo] = useState("");
  const [profesorSeleccionado, setProfesorSeleccionado] = useState("");
  const [gradoSeleccionado, setGradoSeleccionado] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    const fetchProfesores = async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("id_auth, nombre")
        .eq("user_type", "profesor");
      if (error) {
        showToast("Error al cargar profesores: " + error.message, "error");
      } else {
        setProfesores(data);
      }
    };

    const fetchGrados = async () => {
      const { data, error } = await supabase.from("grados").select("id, nombre");
      if (error) {
        showToast("Error al cargar grados: " + error.message, "error");
      } else {
        setGrados(data);
      }
    };

    fetchProfesores();
    fetchGrados();
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombreGrupo || !profesorSeleccionado || !gradoSeleccionado) {
      showToast("Completa todos los campos", "error");
      return;
    }
    setShowModal(true); // Mostrar confirmación
  };

  const handleConfirm = async () => {
    setShowModal(false);

    const { data: grupoExistente, error: errorVerificacion } = await supabase
      .from("grupos")
      .select("id")
      .eq("nombre", nombreGrupo)
      .eq("grado_id", gradoSeleccionado)
      .eq("profesor_id", profesorSeleccionado)
      .maybeSingle();

    if (errorVerificacion) {
      showToast("Error al verificar grupo existente: " + errorVerificacion.message, "error");
      return;
    }

    if (grupoExistente) {
      showToast("Este grupo ya está asignado a este profesor.", "warning");
      return;
    }

    const { error } = await supabase.from("grupos").insert([
      {
        nombre: nombreGrupo,
        profesor_id: profesorSeleccionado,
        grado_id: gradoSeleccionado,
      },
    ]);

    if (error) {
      showToast("Error al crear grupo: " + error.message, "error");
    } else {
      showToast("Grupo creado y asignado correctamente", "success");
      setNombreGrupo("");
      setProfesorSeleccionado("");
      setGradoSeleccionado("");
    }
  };

  return (
    <div className="directora-asignar-grupos-container">
      <h2>Asignar Grupo a Profesor</h2>
      <form onSubmit={handleSubmit}>
        <label>Nombre del grupo (ejemplo: A):</label>
        <input
          type="text"
          value={nombreGrupo}
          onChange={(e) => setNombreGrupo(e.target.value)}
          placeholder="Ejemplo: A"
        />

        <label>Grado:</label>
        <select
          value={gradoSeleccionado}
          onChange={(e) => setGradoSeleccionado(e.target.value)}
        >
          <option value="">Selecciona un grado</option>
          {grados.map((grado) => (
            <option key={grado.id} value={grado.id}>
              {grado.nombre}
            </option>
          ))}
        </select>

        <label>Profesor:</label>
        <select
          value={profesorSeleccionado}
          onChange={(e) => setProfesorSeleccionado(e.target.value)}
        >
          <option value="">Selecciona un profesor</option>
          {profesores.map((prof) => (
            <option key={prof.id_auth} value={prof.id_auth}>
              {prof.nombre}
            </option>
          ))}
        </select>

        <button type="submit">Crear y Asignar Grupo</button>
      </form>

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={showModal}
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
        message="¿Estás seguro de que deseas crear y asignar este grupo?"
      />

      {/* Toast de notificación */}
      {toast.show && <ToastMessage type={toast.type} message={toast.message} />}
    </div>
  );
};

export default DirectoraAsignarGrupos;
