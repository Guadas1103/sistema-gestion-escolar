import React, { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import ConfirmModal from "../components/ConfirmModal";
import { exportarBoletaPDF } from "../utils/pdfUtils"; // Importa la función común
import "../styles/DirectoraVerBoletas.css";

const DirectoraVerBoletas = () => {
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");
  const [alumnos, setAlumnos] = useState([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [busquedaAlumno, setBusquedaAlumno] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const fetchGrupos = async () => {
      const { data, error } = await supabase
        .from("grupos")
        .select(`
          id,
          nombre,
          grado_id,
          grados(nombre),
          profesor_id,
          usuarios:usuarios!grupos_profesor_id_fkey(nombre)
        `)
        .order("nombre", { ascending: true });
      if (!error) setGrupos(data);
      else console.error("Error al cargar grupos:", error);
    };
    fetchGrupos();
  }, []);

  useEffect(() => {
    const fetchDatos = async () => {
      if (!grupoSeleccionado) {
        setAlumnos([]);
        setAlumnoSeleccionado(null);
        setPeriodos([]);
        setMaterias([]);
        setCalificaciones([]);
        return;
      }

      const { data: alumnosData } = await supabase
        .from("alumnos")
        .select("id, nombre, curp")
        .eq("grupo_id", grupoSeleccionado);

      const { data: periodosData } = await supabase
        .from("periodos")
        .select("*")
        .order("inicio", { ascending: true });

      const grupo = grupos.find((g) => g.id === grupoSeleccionado);
      let materiasData = [];
      if (grupo?.grado_id) {
        const resMaterias = await supabase
          .from("materias_por_grado")
          .select("materia_id, materias(nombre)")
          .eq("grado_id", grupo.grado_id);
        materiasData = resMaterias.data || [];
      }

      const alumnoIds = alumnosData?.map((a) => a.id) || [];
      const materiaIds = materiasData?.map((m) => m.materia_id) || [];
      let califData = [];
      if (alumnoIds.length > 0 && materiaIds.length > 0) {
        const { data: califRes } = await supabase
          .from("calificaciones")
          .select("*")
          .in("alumno_id", alumnoIds)
          .in("materia_id", materiaIds);
        califData = califRes || [];
      }

      setAlumnos(alumnosData || []);
      setPeriodos(periodosData || []);
      setMaterias(materiasData || []);
      setCalificaciones(califData);
      setAlumnoSeleccionado(null);
    };

    fetchDatos();
  }, [grupoSeleccionado, grupos]);

  const ordenarPeriodos = (periodos) => {
    const meses = periodos
      .filter((p) => p.tipo === "mensual")
      .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

    const trimestres = periodos.filter((p) => p.tipo === "trimestral");
    const resultado = [...meses];

    trimestres.forEach((trimestre) => {
      const mesesDelTrimestre = meses.filter((m) => m.trimestre_id === trimestre.id);
      if (mesesDelTrimestre.length === 0) {
        resultado.push(trimestre);
      } else {
        const ultimoMes = mesesDelTrimestre[mesesDelTrimestre.length - 1];
        const indexUltimoMes = resultado.findIndex((m) => m.id === ultimoMes.id);
        resultado.splice(indexUltimoMes + 1, 0, trimestre);
      }
    });

    return resultado;
  };

  const periodosOrdenados = ordenarPeriodos(periodos);

  const calcularCalificacion = (alumnoId, materiaId, periodoId) => {
    const calif = calificaciones.find(
      (c) =>
        c.alumno_id === alumnoId &&
        c.materia_id === materiaId &&
        c.periodo_id === periodoId
    );
    return calif ? calif.calificacion : "-";
  };

  const calcularPromedioFinal = (alumnoId, materiaId) => {
    const califs = calificaciones.filter(
      (c) => c.alumno_id === alumnoId && c.materia_id === materiaId
    );
    if (califs.length === 0) return "-";
    const promedio =
      califs.reduce((acc, c) => acc + (c.calificacion || 0), 0) / califs.length;
    return Math.round(promedio);
  };

  const exportarPDF = () => {
    if (!alumnoSeleccionado) return;

    const grupo = grupos.find((g) => g.id === grupoSeleccionado);

    exportarBoletaPDF({
      alumno: alumnoSeleccionado,
      grupo,
      materias,
      periodosOrdenados,
      calificaciones,
      mostrarToast: () => {}, // Aquí no tienes toast, puedes pasar una función vacía o una real si quieres
    });
  };

  const alumnosFiltrados = alumnos.filter((a) =>
    a.nombre.toLowerCase().includes(busquedaAlumno.toLowerCase())
  );

  return (
    <div className="directora-boletas-container">
      <h2>Boletas de Calificaciones</h2>

      <div className="form-filtros">
        <select
          value={grupoSeleccionado}
          onChange={(e) => {
            setGrupoSeleccionado(e.target.value);
            setAlumnoSeleccionado(null);
          }}
        >
          <option value="">Selecciona un grupo</option>
          {grupos.map((grupo) => (
            <option key={grupo.id} value={grupo.id}>
              {grupo.nombre} - {grupo.grados?.nombre || "Sin grado"} - Prof:{" "}
              {grupo.usuarios?.nombre || "Sin profesor"}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Buscar alumno..."
          value={busquedaAlumno}
          onChange={(e) => setBusquedaAlumno(e.target.value)}
        />
      </div>

      <div className="lista-alumnos">
        {alumnosFiltrados.length === 0 && <p>No hay alumnos que coincidan</p>}
        {alumnosFiltrados.map((alumno) => (
          <button
            key={alumno.id}
            className={`alumno-btn ${alumnoSeleccionado?.id === alumno.id ? "seleccionado" : ""}`}
            onClick={() => setAlumnoSeleccionado(alumno)}
          >
            {alumno.nombre}
          </button>
        ))}
      </div>

      {alumnoSeleccionado && (
        <div className="tabla-boleta-container">
          <h3>Boleta de {alumnoSeleccionado.nombre}</h3>
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
                    {periodosOrdenados.map((periodo) => (
                      <td key={periodo.id}>
                        {calcularCalificacion(
                          alumnoSeleccionado.id,
                          materia.materia_id,
                          periodo.id
                        )}
                      </td>
                    ))}
                    <td className="promedio-final">
                      {calcularPromedioFinal(
                        alumnoSeleccionado.id,
                        materia.materia_id
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="btn-generate-pdf"
          >
            Exportar PDF
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={() => {
          setShowConfirmModal(false);
          exportarPDF();
        }}
        onCancel={() => setShowConfirmModal(false)}
        message={`¿Deseas generar e imprimir el PDF de la boleta de ${alumnoSeleccionado?.nombre}?`}
      />
    </div>
  );
};

export default DirectoraVerBoletas;
