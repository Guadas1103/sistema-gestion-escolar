import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProfesorDashboard.css';

const ProfesorDashboard = () => {
  return (
    <div className="profesor-dashboard-container">
      <h1>Bienvenido Profesor</h1>
      <p>Aquí puedes gestionar tus clases y ver el progreso de los estudiantes.</p>

      <div className="profesor-dashboard-options">
        <div className="profesor-option">
          <h3>Mis Clases</h3>
          <p>Accede a tus clases y administra el contenido que se va a enseñar.</p>
          <Link to="/ProfesorClases">
            <button>Mis Clases</button>
          </Link>
        </div>

        <div className="profesor-option">
          <h3>Ver Calificaciones</h3>
          <p>Revisa las calificaciones y progreso de los estudiantes en tus clases.</p>
          <Link to="/ProfesorCalificaciones">
            <button>Ver Calificaciones</button>
          </Link>
        </div>

        <div className="profesor-option">
          <h3>Caracterización del grupo</h3>
          <p>Caracterizar el grupo.</p>
          <Link to="/ProfesorCaracterizacion">
            <button>Caracterización del grupo</button>
          </Link>
        </div>

        <div className="profesor-option">
          <h3>Agregar Alumno</h3>
          <p>Registrar nuevos alumnos en tu grupo.</p>
          <Link to="/ProfesorAgregarAlumno">
            <button>Agregar Alumno</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfesorDashboard;
