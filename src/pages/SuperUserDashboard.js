import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SuperUserDashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard-container">
      <h1>Bienvenido Administrador</h1>
      <p>Aquí puedes gestionar los usuarios, el contenido y las configuraciones del sistema.</p>

      <div className="admin-dashboard-options">
        <div className="admin-option">
          <h3>Gestionar Usuarios</h3>
          <p>Administra los usuarios de la plataforma, agrega o elimina cuentas.</p>
          <Link to="/SuperUserGestionarUsuarios">
            <button>Gestionar Usuarios</button>
          </Link>
        </div>
        <div className="admin-option">
          <h3>Modificar Plataforma</h3>
          <p>Modifica las configuraciones generales del sistema y personaliza la plataforma.</p>
          <Link to="/SuperUserModificarPlataforma">
            <button>Configurar Plataforma</button>
          </Link>
        </div>
        {/*<div className="admin-option">
          <h3>Ver Informes</h3>
          <p>Revisa los informes y las estadísticas de uso y rendimiento de la plataforma.</p>
          <Link to="/informes">
            <button>Ver Informes</button>
          </Link>
        </div>*/}
      </div>
    </div>
  );
};

export default AdminDashboard;
