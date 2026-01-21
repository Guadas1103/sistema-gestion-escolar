import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/DirectoraDashboard.css';

const DirectoraDashboard = () => {
  return (
    <div className="directora-dashboard-container">
      <h1>Bienvenida Directora</h1>
      <p>Aquí puedes administrar el contenido y usuarios dentro de la plataforma.</p>

      <div className="directora-dashboard-options">
        <div className="directora-option">
          <h3>Cambiar Noticias</h3>
          <p>Modifica las noticias y anuncios que verán los usuarios.</p>
          <Link to="/DirectoraCambiarNoticias">
            <button>Cambiar Noticias</button>
          </Link>
        </div>
        <div className="directora-option">
          <h3>Agregar Nuevos Usuarios</h3>
          <p>Agrega nuevos usuarios al sistema.</p>
          <Link to="/DirectoraAgregarUsuarios">
            <button>Agregar Usuarios</button>
          </Link>
        </div>
        <div className="directora-option">
          <h3>Ver Boletas</h3>
          <p>Visualizar las boletas de los alumnos.</p>
          <Link to="/DirectoraVerBoletas">
            <button>Ver Boletas</button>
          </Link>

        </div>
        <div className="directora-option">
          <h3>Asignar Grupos</h3>
          <p>Asignar profesores a sus grupos correspondientes.</p>
          <Link to="/DirectoraAsignarGrupos">
            <button>Asignar Grupos a Profesores</button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default DirectoraDashboard;
