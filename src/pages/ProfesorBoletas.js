import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import ToastMessage from "../components/ToastMessage";
import ConfirmModal from "../components/ConfirmModal";
import { exportarBoletaPDF } from "../utils/pdfUtils"; // Importa la función común
import "../styles/ProfesorBoletas.css";

const ProfesorBoletas = () => {
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState("");
  const [periodos, setPeriodos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAlumno, setPendingAlumno] = useState(null);

  const ordenarPeriodos = (periodos) => {
    const meses = periodos.filter(p => p.tipo === "mensual").sort((a, b) => new Date(a.inicio) - new Date(b.inicio));
    const trimestres = periodos.filter(p => p.tipo === "trimestral");
    const resultado = [...meses];

    trimestres.forEach(trimestre => {
      const mesesDelTrimestre = meses.filter(m => m.trimestre_id === trimestre.id);
      if (mesesDelTrimestre.length === 0) {
        resultado.push(trimestre);
      } else {
        const ultimoMes = mesesDelTrimestre[mesesDelTrimestre.length - 1];
        const indexUltimoMes = resultado.findIndex(m => m.id === ultimoMes.id);
        resultado.splice(indexUltimoMes + 1, 0, trimestre);
      }
    });

    return resultado;
  };

  const calcularPromedioFinal = (alumnoId, materiaId) => {
    const califs = calificaciones.filter(
      (c) => c.alumno_id === alumnoId && c.materia_id === materiaId
    );
    if (califs.length === 0) return "-";
    const promedio = califs.reduce((acc, c) => acc + (c.calificacion || 0), 0) / califs.length;
    return Math.round(promedio);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("id_auth")
        .eq("email", user.email)
        .single();

      const { data: gruposData } = await supabase
        .from("grupos")
        .select(`
          id,
          nombre,
          grado_id,
          grados(nombre),
          profesor_id,
          usuarios:usuarios!grupos_profesor_id_fkey(nombre)
        `)
        .eq("profesor_id", usuario.id_auth);


      const { data: periodosData } = await supabase
        .from("periodos")
        .select("id, clave, tipo, inicio, trimestre_id")
        .order("inicio", { ascending: true });

      setGrupos(gruposData || []);
      setPeriodos(periodosData || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchBoletaData = async () => {
      if (!grupoSeleccionadoId) {
        setAlumnos([]);
        setCalificaciones([]);
        setMaterias([]);
        setAlumnoSeleccionado(null);
        return;
      }

      setLoading(true);

      const { data: alumnosData } = await supabase
        .from("alumnos")
        .select("id, nombre, curp")
        .eq("grupo_id", grupoSeleccionadoId);

      const grupo = grupos.find((g) => g.id === grupoSeleccionadoId);
      const gradoId = grupo?.grado_id;

      const { data: materiasData } = await supabase
        .from("materias_por_grado")
        .select("materia_id, materias(nombre)")
        .eq("grado_id", gradoId);

      const alumnoIds = alumnosData?.map((a) => a.id) || [];
      const materiaIds = materiasData?.map((m) => m.materia_id) || [];
      const periodoIds = periodos.map((p) => p.id);

      let califData = [];
      if (alumnoIds.length && materiaIds.length && periodoIds.length) {
        const { data: calificacionesResponse } = await supabase
          .from("calificaciones")
          .select("id, alumno_id, materia_id, periodo_id, calificacion")
          .in("alumno_id", alumnoIds)
          .in("materia_id", materiaIds)
          .in("periodo_id", periodoIds);

        califData = calificacionesResponse || [];
      }

      setAlumnos(alumnosData || []);
      setMaterias(materiasData || []);
      setCalificaciones(califData);
      setAlumnoSeleccionado(null);
      setLoading(false);
    };

    fetchBoletaData();
  }, [grupoSeleccionadoId, grupos, periodos]);

  const mostrarToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  const confirmarGeneracionPDF = (alumno) => {
    setPendingAlumno(alumno);
    setIsModalOpen(true);
  };

  const generarPDF = (alumno) => {
    if (!alumno || materias.length === 0 || periodos.length === 0) {
      mostrarToast("Faltan datos para generar la boleta.", "error");
      return;
    }

    const grupo = grupos.find((g) => g.id === grupoSeleccionadoId);
    const periodosOrdenados = ordenarPeriodos(periodos);

    exportarBoletaPDF({
      alumno,
      grupo,
      materias,
      periodosOrdenados,
      calificaciones,
      mostrarToast,
    });

    setIsModalOpen(false);
    setPendingAlumno(null);
  };

  const periodosOrdenados = ordenarPeriodos(periodos);

  return (
    <div className="profesor-boletas-container">
      <h2>Boletas</h2>

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

        {alumnos.length > 0 && (
          <select
            value={alumnoSeleccionado?.id || ""}
            onChange={(e) => {
              const alumno = alumnos.find((a) => a.id === e.target.value);
              setAlumnoSeleccionado(alumno || null);
            }}
            className="custom-select"
          >
            <option value="">Selecciona un alumno</option>
            {alumnos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && <p>Cargando...</p>}
      {!loading && alumnos.length === 0 && grupoSeleccionadoId && <p>No hay alumnos en este grupo.</p>}
      {!loading && materias.length === 0 && grupoSeleccionadoId && <p>No hay materias para este grupo.</p>}

      {alumnoSeleccionado && (
        <div className="boleta-preview">
          <h3>Vista previa de la boleta para {alumnoSeleccionado.nombre}</h3>
          <div className="tabla-scroll-container">
            <table className="tabla-boletas">
              <thead>
                <tr>
                  <th>Materia</th>
                  {periodosOrdenados.map((p) => (
                    <th key={p.id}>{p.clave}</th>
                  ))}
                  <th>Promedio final</th>
                </tr>
              </thead>
              <tbody>
                {materias.map((materia) => (
                  <tr key={materia.materia_id}>
                    <td>{materia.materias.nombre}</td>
                    {periodosOrdenados.map((periodo) => {
                      const calif = calificaciones.find(
                        (c) =>
                          c.alumno_id === alumnoSeleccionado.id &&
                          c.materia_id === materia.materia_id &&
                          c.periodo_id === periodo.id
                      );
                      return <td key={periodo.id}>{calif ? calif.calificacion : "-"}</td>;
                    })}
                    <td className="promedio-final">
                      {calcularPromedioFinal(alumnoSeleccionado.id, materia.materia_id)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            className="btn-generate-pdf"
            onClick={() => confirmarGeneracionPDF(alumnoSeleccionado)}
          >
            Generar PDF de boleta para {alumnoSeleccionado.nombre}
          </button>
        </div>
      )}

      {toast.visible && <ToastMessage message={toast.message} type={toast.type} />}

      <ConfirmModal
        isOpen={isModalOpen}
        message={`¿Generar boleta para ${pendingAlumno?.nombre}?`}
        onConfirm={() => generarPDF(pendingAlumno)}
        onCancel={() => {
          setIsModalOpen(false);
          setPendingAlumno(null);
        }}
      />
    </div>
  );
};

export default ProfesorBoletas;
