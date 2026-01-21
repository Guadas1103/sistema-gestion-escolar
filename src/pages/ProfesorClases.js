import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import "../styles/ProfesorClases.css";

// ...imports igual

const ProfesorClases = () => {
  const [grupos, setGrupos] = useState([]);
  const [alumnosPorGrupo, setAlumnosPorGrupo] = useState({});
  const [grupoExpandidoId, setGrupoExpandidoId] = useState(null);
  const [filtroAlumno, setFiltroAlumno] = useState("");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [caracteristicas, setCaracteristicas] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    const fetchGrupos = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return;

      const { data: usuarioData } = await supabase
        .from("usuarios")
        .select("id_auth")
        .eq("email", user.email)
        .single();

      const idAuth = usuarioData.id_auth;

      const { data: gruposData } = await supabase
        .from("grupos")
        .select("id, nombre, grado_id, grados(nombre)")
        .eq("profesor_id", idAuth);

      setGrupos(gruposData || []);
    };

    fetchGrupos();
  }, []);

  const toggleMostrarAlumnos = async (grupoId) => {
    if (grupoExpandidoId === grupoId) {
      setGrupoExpandidoId(null);
      setFiltroAlumno("");
      setAlumnoSeleccionado(null);
      setModalAbierto(false);
      return;
    }

    if (!alumnosPorGrupo[grupoId]) {
      const { data: alumnosData } = await supabase
        .from("alumnos")
        .select("id, nombre, curp, caracteristicas") // ✅ Aquí agregamos la CURP
        .eq("grupo_id", grupoId);

      setAlumnosPorGrupo((prev) => ({
        ...prev,
        [grupoId]: alumnosData || [],
      }));
    }

    setGrupoExpandidoId(grupoId);
    setFiltroAlumno("");
    setAlumnoSeleccionado(null);
    setModalAbierto(false);
  };

  const alumnosFiltrados =
    grupoExpandidoId && alumnosPorGrupo[grupoExpandidoId]
      ? alumnosPorGrupo[grupoExpandidoId].filter((alumno) =>
          alumno.nombre.toLowerCase().includes(filtroAlumno.toLowerCase())
        )
      : [];

  const seleccionarAlumno = (alumno) => {
    try {
      let parsed;
      if (typeof alumno.caracteristicas === "string") {
        parsed = JSON.parse(alumno.caracteristicas);
      } else {
        parsed = alumno.caracteristicas || {};
      }
      setCaracteristicas(parsed);
    } catch (err) {
      console.error("Error parseando características:", err);
      setCaracteristicas({});
    }
    setAlumnoSeleccionado(alumno);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setAlumnoSeleccionado(null);
    setCaracteristicas(null);
  };

  const getSemaforoTexto = (color) => {
    switch (color) {
      case "verde":
        return "Estable y centrado";
      case "amarillo":
        return "Inquieto o requiere atención";
      case "rojo":
        return "Con alteraciones importantes";
      default:
        return "No definido";
    }
  };

  return (
    <div className="profesor-clases-container">
      <h2>Mis Clases</h2>
      {grupos.map((grupo) => (
        <div key={grupo.id} className="grupo-card">
          <div className="grupo-info">
            <h3>
              {grupo.grados?.nombre} - {grupo.nombre}
            </h3>
            <button onClick={() => toggleMostrarAlumnos(grupo.id)}>
              {grupoExpandidoId === grupo.id ? "Ocultar Alumnos" : "Ver Alumnos"}
            </button>
          </div>

          {grupoExpandidoId === grupo.id && (
            <>
              <div className="input-filtro-alumno-wrapper">
                <input
                  type="text"
                  placeholder="Buscar alumno..."
                  value={filtroAlumno}
                  onChange={(e) => setFiltroAlumno(e.target.value)}
                  className="input-filtro-alumno"
                />
                <svg viewBox="0 0 24 24">
                  <path d="M21 21l-4.35-4.35M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" stroke="#7c8798" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>

              <ul className="lista-alumnos">
                {alumnosFiltrados.length === 0 && <li>No se encontraron alumnos</li>}
                {alumnosFiltrados.map((alumno) => (
                  <li key={alumno.id} className="alumno-item">
                    <span>{alumno.nombre}</span>
                    <button
                      className="btn-ver-ficha"
                      onClick={() => seleccionarAlumno(alumno)}
                    >
                      Ver ficha escolar
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}

      {modalAbierto && alumnoSeleccionado && caracteristicas && (
        <div className="modal-fondo" onClick={cerrarModal}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <h3>Ficha de Caracterización</h3>

            <div className="ficha-dato">
              <strong>Nombre del alumno:</strong> {alumnoSeleccionado.nombre}
            </div>

            <div className="ficha-dato">
              <strong>CURP:</strong> {alumnoSeleccionado.curp || "No registrada"} {/* ✅ Mostrar la CURP */}
            </div>

            <div className="ficha-dato">
              <strong>Semáforo emocional:</strong>
              <div className="semaforo-wrapper">
                <div
                  className={`semaforo-indicador semaforo-${caracteristicas?.semaforo_emocional || "no-definido"
                    }`}
                />
                <span>{getSemaforoTexto(caracteristicas?.semaforo_emocional)}</span>
              </div>
            </div>

            <div className="ficha-dato">
              <strong>Discapacidades:</strong>
              <ul>
                {caracteristicas.usa_silla_ruedas && <li>Usa silla de ruedas</li>}
                {caracteristicas.necesita_apoyo_auditivo && <li>Necesita apoyo auditivo</li>}
                {!caracteristicas.usa_silla_ruedas && !caracteristicas.necesita_apoyo_auditivo && (
                  <li>Ninguna registrada</li>
                )}
              </ul>
            </div>

            {caracteristicas.otras && (
              <div className="ficha-dato">
                <strong>Otras observaciones:</strong> {caracteristicas.otras}
              </div>
            )}

            <button onClick={cerrarModal} className="btn-cerrar-modal">
              Cerrar ficha
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfesorClases;
