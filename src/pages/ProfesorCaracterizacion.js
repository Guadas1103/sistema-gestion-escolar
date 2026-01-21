import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import ConfirmModal from "../components/ConfirmModal";
import ToastMessage from "../components/ToastMessage";
import "../styles/ProfesorCaracterizacion.css";

const ProfesorCaracterizacion = () => {
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [alumnoAEliminar, setAlumnoAEliminar] = useState(null);

  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const mostrarToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "success" });
    }, 3000);
  };

  // Obtener grupos
  useEffect(() => {
    const fetchGrupos = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        mostrarToast("Error al obtener usuario", "error");
        return;
      }

      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuarios")
        .select("id_auth")
        .eq("email", user.email)
        .single();

      if (usuarioError || !usuarioData) {
        mostrarToast("No se pudo obtener información del profesor.", "error");
        return;
      }

      const idAuth = usuarioData.id_auth;

      const { data, error } = await supabase
        .from("grupos")
        .select("id, nombre, grado_id, grados(nombre)")
        .eq("profesor_id", idAuth);

      if (error) {
        mostrarToast("Error al cargar grupos: " + error.message, "error");
      } else {
        setGrupos(data);
      }
    };

    fetchGrupos();
  }, []);

  // Obtener alumnos del grupo seleccionado
  useEffect(() => {
    if (!grupoSeleccionado) {
      setAlumnos([]);
      return;
    }
    setLoading(true);

    const fetchAlumnos = async () => {
      const { data, error } = await supabase
        .from("alumnos")
        .select("id, nombre, caracteristicas")
        .eq("grupo_id", grupoSeleccionado);

      if (error) {
        mostrarToast("Error al cargar alumnos: " + error.message, "error");
        setAlumnos([]);
      } else {
        setAlumnos(data);
      }
      setLoading(false);
    };

    fetchAlumnos();
  }, [grupoSeleccionado]);

  const handleNombreChange = (id, nuevoNombre) => {
    setAlumnos((prev) =>
      prev.map((al) => (al.id === id ? { ...al, nombre: nuevoNombre } : al))
    );
  };

  const handleCaracteristicasChange = (id, campo, valor) => {
    setAlumnos((prev) =>
      prev.map((al) =>
        al.id === id
          ? {
              ...al,
              caracteristicas: {
                ...al.caracteristicas,
                [campo]: valor,
              },
            }
          : al
      )
    );
  };

  const handleGuardar = async (alumno) => {
    const { id, nombre, caracteristicas } = alumno;
    const { error } = await supabase
      .from("alumnos")
      .update({ nombre, caracteristicas })
      .eq("id", id);

    if (error) {
      mostrarToast("Error al actualizar alumno: " + error.message, "error");
    } else {
      mostrarToast("Alumno actualizado correctamente", "success");
    }
  };

  const abrirModalEliminar = (id) => {
    setAlumnoAEliminar(id);
    setModalOpen(true);
  };

  const confirmarEliminar = async () => {
    if (!alumnoAEliminar) return;

    const { error } = await supabase.from("alumnos").delete().eq("id", alumnoAEliminar);

    if (error) {
      mostrarToast("Error al eliminar alumno: " + error.message, "error");
    } else {
      setAlumnos((prev) => prev.filter((al) => al.id !== alumnoAEliminar));
      mostrarToast("Alumno eliminado correctamente", "success");
    }

    setModalOpen(false);
    setAlumnoAEliminar(null);
  };

  const cancelarEliminar = () => {
    setModalOpen(false);
    setAlumnoAEliminar(null);
  };

  return (
    <div className="profesor-caracterizacion-container">
      <h2>Caracterización de mis grupos</h2>

      <label htmlFor="select-grupo">Selecciona un grupo:</label>
      <select
        id="select-grupo"
        value={grupoSeleccionado || ""}
        onChange={(e) => setGrupoSeleccionado(e.target.value)}
      >
        <option value="">-- Selecciona un grupo --</option>
        {grupos.map((grupo) => (
          <option key={grupo.id} value={grupo.id}>
            {grupo.nombre} - {grupo.grados?.nombre || "Grado no asignado"}
          </option>
        ))}
      </select>

      {loading && <p>Cargando alumnos...</p>}

      {!loading && grupoSeleccionado && (
        <>
          {alumnos.length === 0 ? (
            <p>No hay alumnos en este grupo.</p>
          ) : (
            <table className="tabla-alumnos">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Usa silla de ruedas</th>
                  <th>Apoyo auditivo</th>
                  <th>Otras características</th>
                  <th>Semáforo emocional</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => (
                  <tr key={alumno.id}>
                    <td>
                      <input
                        type="text"
                        value={alumno.nombre}
                        onChange={(e) =>
                          handleNombreChange(alumno.id, e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={alumno.caracteristicas?.usa_silla_ruedas || false}
                        onChange={(e) =>
                          handleCaracteristicasChange(
                            alumno.id,
                            "usa_silla_ruedas",
                            e.target.checked
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={alumno.caracteristicas?.necesita_apoyo_auditivo || false}
                        onChange={(e) =>
                          handleCaracteristicasChange(
                            alumno.id,
                            "necesita_apoyo_auditivo",
                            e.target.checked
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={alumno.caracteristicas?.otras || ""}
                        onChange={(e) =>
                          handleCaracteristicasChange(
                            alumno.id,
                            "otras",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td>
                      <select
                        value={alumno.caracteristicas?.semaforo_emocional || ""}
                        onChange={(e) =>
                          handleCaracteristicasChange(
                            alumno.id,
                            "semaforo_emocional",
                            e.target.value
                          )
                        }
                      >
                        <option value="">-- Selecciona --</option>
                        <option value="verde">🟢 Verde</option>
                        <option value="amarillo">🟡 Amarillo</option>
                        <option value="rojo">🔴 Rojo</option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => handleGuardar(alumno)}>Guardar</button>
                      <button onClick={() => abrirModalEliminar(alumno.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={modalOpen}
        onConfirm={confirmarEliminar}
        onCancel={cancelarEliminar}
        message="¿Seguro que quieres eliminar este alumno?"
      />

      {toast.visible && <ToastMessage message={toast.message} type={toast.type} />}
    </div>
  );
};

export default ProfesorCaracterizacion;
