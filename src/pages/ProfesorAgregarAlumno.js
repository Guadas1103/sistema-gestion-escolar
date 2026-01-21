import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import "../styles/ProfesorAgregarAlumno.css";
import ToastMessage from "../components/ToastMessage";

const ProfesorAgregarAlumno = () => {
  const [nombre, setNombre] = useState("");
  const [curp, setCurp] = useState(""); // ✅ NUEVO estado para la CURP
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState("");
  const [caracteristicas, setCaracteristicas] = useState({
    usa_silla_ruedas: false,
    necesita_apoyo_auditivo: false,
    otras: ""
  });
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const fetchGrupos = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMensaje("Error al obtener el usuario");
        return;
      }

      const { data: usuarioData, error: usuarioError } = await supabase
        .from("usuarios")
        .select("id_auth")
        .eq("email", user.email)
        .single();

      if (usuarioError || !usuarioData) {
        setMensaje("No se pudo obtener información del profesor.");
        return;
      }

      const idAuth = usuarioData.id_auth;

      const { data, error } = await supabase
        .from("grupos")
        .select("id, nombre, grado_id, grados(nombre)")
        .eq("profesor_id", idAuth);

      if (error) {
        setMensaje("Error al cargar los grupos.");
      } else {
        setGrupos(data);
      }
    };

    fetchGrupos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre || !curp || !grupoSeleccionadoId) {
      setMensaje("Completa todos los campos, incluyendo la CURP");
      return;
    }

    const grupoSeleccionado = grupos.find(g => String(g.id) === grupoSeleccionadoId);
    if (!grupoSeleccionado) {
      setMensaje("Grupo no válido seleccionado");
      return;
    }

    const caracteristicasJSON = {
      usa_silla_ruedas: caracteristicas.usa_silla_ruedas,
      necesita_apoyo_auditivo: caracteristicas.necesita_apoyo_auditivo,
      otras: caracteristicas.otras,
    };

    const { error } = await supabase.from("alumnos").insert([
      {
        nombre,
        curp, // ✅ Se agrega la CURP al insert
        grupo_id: grupoSeleccionado.id,
        grado_id: grupoSeleccionado.grado_id,
        caracteristicas: caracteristicasJSON,
      },
    ]);

    if (error) {
      setMensaje("Error al agregar alumno: " + error.message);
    } else {
      setMensaje("Alumno agregado correctamente");
      setNombre("");
      setCurp(""); // ✅ Limpiar campo CURP
      setGrupoSeleccionadoId("");
      setCaracteristicas({
        usa_silla_ruedas: false,
        necesita_apoyo_auditivo: false,
        otras: ""
      });
    }
  };

  return (
    <div className="profesor-agregar-alumno-container">
      <h2>Agregar Alumno</h2>

      <ToastMessage message={mensaje} onClose={() => setMensaje("")} />

      <form className="alumno-form" onSubmit={handleSubmit}>
        <label>
          Nombre del alumno:
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </label>

        <label>
          CURP del alumno: {/* ✅ NUEVO campo de entrada */}
          <input
            type="text"
            value={curp}
            onChange={(e) => setCurp(e.target.value.toUpperCase())}
            required
          />
        </label>

        <label>
          Grupo:
          <select
            value={grupoSeleccionadoId}
            onChange={(e) => setGrupoSeleccionadoId(e.target.value)}
            required
          >
            <option value="">Selecciona un grupo</option>
            {grupos.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nombre} - {grupo.grados?.nombre || "Sin grado"}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend>Características especiales</legend>
          <label>
            <input
              type="checkbox"
              checked={caracteristicas.usa_silla_ruedas}
              onChange={(e) =>
                setCaracteristicas({
                  ...caracteristicas,
                  usa_silla_ruedas: e.target.checked,
                })
              }
            />
            Usa silla de ruedas
          </label>

          <label>
            <input
              type="checkbox"
              checked={caracteristicas.necesita_apoyo_auditivo}
              onChange={(e) =>
                setCaracteristicas({
                  ...caracteristicas,
                  necesita_apoyo_auditivo: e.target.checked,
                })
              }
            />
            Necesita apoyo auditivo
          </label>

          <label>
            Otras características:
            <input
              type="text"
              value={caracteristicas.otras}
              onChange={(e) =>
                setCaracteristicas({
                  ...caracteristicas,
                  otras: e.target.value,
                })
              }
            />
          </label>
        </fieldset>

        <button type="submit">Agregar Alumno</button>
      </form>
    </div>
  );
};

export default ProfesorAgregarAlumno;
