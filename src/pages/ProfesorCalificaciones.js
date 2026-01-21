import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import ToastMessage from "../components/ToastMessage";
// Importa aquí el componente de Boletas cuando lo tengas listo
// import BoletasView from "./BoletasView";

import "../styles/ProfesorCalificaciones.css";
import ProfesorBoletas from "./ProfesorBoletas";

const ProfesorCalificaciones = () => {
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState("");
  const [periodos, setPeriodos] = useState([]);
  const [periodoSeleccionadoId, setPeriodoSeleccionadoId] = useState("");
  const [periodoSeleccionadoTipo, setPeriodoSeleccionadoTipo] = useState("");
  const [calificaciones, setCalificaciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedAlumnoId, setExpandedAlumnoId] = useState(null);
  const [califEditadas, setCalifEditadas] = useState({});
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  // Nuevo estado para el submenú activo
  const [menuActivo, setMenuActivo] = useState("calificaciones"); // puede ser "calificaciones" o "boletas"

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("id_auth")
        .eq("email", user.email)
        .single();

      const { data: gruposData } = await supabase
        .from("grupos")
        .select("id, nombre, grado_id, grados(nombre)")
        .eq("profesor_id", usuario.id_auth);

      const { data: periodosData } = await supabase
        .from("periodos")
        .select("id, clave, tipo")
        .order("inicio", { ascending: false });

      setGrupos(gruposData || []);
      setPeriodos(periodosData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCalificaciones = async () => {
      if (!grupoSeleccionadoId || !periodoSeleccionadoId) {
        setAlumnos([]);
        setMaterias([]);
        setCalificaciones([]);
        return;
      }

      setLoading(true);

      const periodoSeleccionado = periodos.find(p => p.id === periodoSeleccionadoId);
      setPeriodoSeleccionadoTipo(periodoSeleccionado?.tipo || "");

      const { data: alumnosData } = await supabase
        .from("alumnos")
        .select("id, nombre")
        .eq("grupo_id", grupoSeleccionadoId);

      const grupo = grupos.find((g) => g.id === grupoSeleccionadoId);
      const gradoId = grupo?.grado_id;

      const { data: materiasData } = await supabase
        .from("materias_por_grado")
        .select("materia_id, materias(nombre)")
        .eq("grado_id", gradoId);

      const { data: califData } = await supabase
        .from("calificaciones")
        .select("id, alumno_id, materia_id, calificacion, periodo_id")
        .eq("periodo_id", periodoSeleccionadoId);

      setAlumnos(alumnosData || []);
      setMaterias(materiasData || []);
      setCalificaciones(califData || []);
      setCalifEditadas({});
      setExpandedAlumnoId(null);
      setLoading(false);
    };

    fetchCalificaciones();
  }, [grupoSeleccionadoId, periodoSeleccionadoId, grupos, periodos]);

  const toggleExpandAlumno = (alumnoId) => {
    setExpandedAlumnoId((prev) => (prev === alumnoId ? null : alumnoId));
  };

  const obtenerCalificacion = (alumnoId, materiaId) => {
    const calif = calificaciones.find(
      (c) => c.alumno_id === alumnoId && c.materia_id === materiaId
    );
    return calif ? calif.calificacion : "-";
  };

  const mostrarToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "success" });
    }, 3000);
  };

  const guardarCalificacion = async (alumnoId, materiaId, calif) => {
    if (periodoSeleccionadoTipo === "trimestral") {
      mostrarToast("No se pueden editar calificaciones trimestrales.", "error");
      return;
    }

    const califNum = Number(calif);
    if (isNaN(califNum) || califNum < 0 || califNum > 10) {
      mostrarToast("La calificación debe ser un número entre 0 y 10", "error");
      return;
    }
    if (!periodoSeleccionadoId) {
      mostrarToast("Selecciona un periodo válido", "error");
      return;
    }

    setLoading(true);

    const califExistente = calificaciones.find(
      (c) =>
        c.alumno_id === alumnoId &&
        c.materia_id === materiaId &&
        c.periodo_id === periodoSeleccionadoId
    );

    if (califExistente) {
      const { error } = await supabase
        .from("calificaciones")
        .update({ calificacion: califNum })
        .eq("id", califExistente.id);

      if (error) {
        mostrarToast("Error al actualizar la calificación: " + error.message, "error");
      } else {
        setCalificaciones((prev) =>
          prev.map((c) =>
            c.id === califExistente.id ? { ...c, calificacion: califNum } : c
          )
        );
        mostrarToast("Calificación actualizada correctamente");
      }
    } else {
      const { error } = await supabase.from("calificaciones").insert([
        {
          alumno_id: alumnoId,
          materia_id: materiaId,
          periodo_id: periodoSeleccionadoId,
          calificacion: califNum,
        },
      ]);

      if (error) {
        mostrarToast("Error al agregar la calificación: " + error.message, "error");
      } else {
        setCalificaciones((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            alumno_id: alumnoId,
            materia_id: materiaId,
            periodo_id: periodoSeleccionadoId,
            calificacion: califNum,
          },
        ]);
        mostrarToast("Calificación agregada correctamente");
      }
    }

    setCalifEditadas((prev) => {
      const nuevo = { ...prev };
      delete nuevo[alumnoId];
      return nuevo;
    });

    setLoading(false);
  };

  return (
    <div className="profesor-calificaciones-container">
      <h2>Gestión de Calificaciones</h2>

      {/* Menú Submenú */}
      <nav className="submenu">
        <button
          className={menuActivo === "calificaciones" ? "activo" : ""}
          onClick={() => setMenuActivo("calificaciones")}
          type="button"
        >
          Calificaciones
        </button>
        <button
          className={menuActivo === "boletas" ? "activo" : ""}
          onClick={() => setMenuActivo("boletas")}
          type="button"
        >
          Boletas
        </button>
      </nav>

      {menuActivo === "calificaciones" && (
        <>
          <div className="filtros">
            <select
              value={grupoSeleccionadoId}
              onChange={(e) => setGrupoSeleccionadoId(e.target.value)}
              className="custom-select"
            >
              <option value="">Selecciona un grupo</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre} - {g.grados?.nombre || "Sin grado"}
                </option>
              ))}
            </select>

            <select
              value={periodoSeleccionadoId}
              onChange={(e) => setPeriodoSeleccionadoId(e.target.value)}
              className="custom-select"
            >
              <option value="">Selecciona un periodo</option>
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.clave} ({p.tipo})
                </option>
              ))}
            </select>
          </div>

          {loading && <p>Cargando...</p>}

          {!loading && alumnos.length > 0 && (
            <div className="alumnos-lista">
              {alumnos.map((a) => (
                <div key={a.id} className="alumno-item">
                  <div
                    className="alumno-header"
                    onClick={() => toggleExpandAlumno(a.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") toggleExpandAlumno(a.id);
                    }}
                  >
                    <strong>{a.nombre}</strong>{" "}
                    <span>{expandedAlumnoId === a.id ? "▲" : "▼"}</span>
                  </div>

                  {expandedAlumnoId === a.id && (
                    <div className="alumno-submenu">
                      {materias.length === 0 && <p>No hay materias para este grupo.</p>}

                      {materias.length > 0 && (
                        <>
                          <table className="tabla-calificaciones-alumno">
                            <thead>
                              <tr>
                                <th>Materia</th>
                                <th>Calificación</th>
                              </tr>
                            </thead>
                            <tbody>
                              {materias.map((m) => {
                                const califActual = obtenerCalificacion(a.id, m.materia_id);
                                const editado = califEditadas[a.id] || {};
                                const isSelected = editado.materiaId === m.materia_id;
                                return (
                                  <tr
                                    key={m.materia_id}
                                    className={isSelected ? "selected-row" : ""}
                                  >
                                    <td>{m.materias.nombre}</td>
                                    <td>{califActual}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>

                          {periodoSeleccionadoTipo !== "trimestral" ? (
                            <div className="editar-calificacion-form">
                              <label>
                                Materia:
                                <select
                                  value={califEditadas[a.id]?.materiaId || ""}
                                  onChange={(e) =>
                                    setCalifEditadas((prev) => ({
                                      ...prev,
                                      [a.id]: {
                                        ...prev[a.id],
                                        materiaId: e.target.value,
                                        calificacion: prev[a.id]?.calificacion || "",
                                      },
                                    }))
                                  }
                                >
                                  <option value="">Selecciona una materia</option>
                                  {materias.map((m) => (
                                    <option key={m.materia_id} value={m.materia_id}>
                                      {m.materias.nombre}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label>
                                Calificación:
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={califEditadas[a.id]?.calificacion || ""}
                                  onChange={(e) =>
                                    setCalifEditadas((prev) => ({
                                      ...prev,
                                      [a.id]: {
                                        ...prev[a.id],
                                        calificacion: e.target.value,
                                      },
                                    }))
                                  }
                                  disabled={!califEditadas[a.id]?.materiaId}
                                />
                              </label>

                              <button
                                disabled={
                                  !califEditadas[a.id]?.materiaId ||
                                  califEditadas[a.id]?.calificacion === ""
                                }
                                onClick={() =>
                                  guardarCalificacion(
                                    a.id,
                                    califEditadas[a.id].materiaId,
                                    califEditadas[a.id].calificacion
                                  )
                                }
                              >
                                Guardar
                              </button>
                            </div>
                          ) : (
                            <p style={{ marginTop: "1rem", color: "#555" }}>
                              Las calificaciones de este periodo se calculan automáticamente.
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && grupoSeleccionadoId && alumnos.length === 0 && (
            <p>No hay alumnos en este grupo.</p>
          )}
        </>
      )}

      {menuActivo === "boletas" && (
        <div>
          
          
          <ProfesorBoletas /> 
        </div>
      )}

      {toast.visible && <ToastMessage message={toast.message} type={toast.type} />}
    </div>
  );
};

export default ProfesorCalificaciones;
