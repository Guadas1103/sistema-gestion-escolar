import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import logo from '../assets/logo.jpg';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useContext(AuthContext);
  const userType = user?.userType;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLinkClick = (event) => {
    event.stopPropagation();
    if (window.innerWidth <= 768) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    const closeMenu = (event) => {
      if (menuOpen && !event.target.closest('.navbar-container')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [menuOpen]);

  const handleLogoutConfirm = () => {
    logout(); // limpia el user del contexto y localStorage
    setShowLogoutModal(false);
    navigate('/');
  };

  return (
    <nav className="navbar-container">
      <img src={logo} alt="Logo" className="logo" />
      <button className="menu-icon" onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>
      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {!user && (
          <>
            <li>
              <Link to="/" className={location.pathname === "/" ? "active" : ""} onClick={handleLinkClick}>Inicio</Link>
            </li>
            <li>
              <Link to="/nosotros" className={location.pathname === "/nosotros" ? "active" : ""} onClick={handleLinkClick}>Nosotros</Link>
            </li>
            <li>
              <Link to="/informacion" className={location.pathname === "/informacion" ? "active" : ""} onClick={handleLinkClick}>Información</Link>
            </li>
            <li>
              <Link to="/contacto" className={location.pathname === "/contacto" ? "active" : ""} onClick={handleLinkClick}>Contacto</Link>
            </li>
          </>
        )}

        {userType === 'superusuario' && (
          <>
            <li><Link to="/SuperUserDashboard" className={location.pathname === "/SuperUserDashboard" ? "active" : ""} onClick={handleLinkClick}>Dashboard</Link></li>
            <li><Link to="/SuperUserGestionarUsuarios" className={location.pathname === "/SuperUserGestionarUsuarios" ? "active" : ""} onClick={handleLinkClick}>Gestionar Usuarios</Link></li>
            <li><Link to="/SuperUserModificarPlataforma" className={location.pathname === "/SuperUserModificarPlataforma" ? "active" : ""} onClick={handleLinkClick}>Modificar Plataforma</Link></li>
          </>
        )}

        {userType === 'directora' && (
          <>
            <li><Link to="/DirectoraDashboard" className={location.pathname === "/DirectoraDashboard" ? "active" : ""} onClick={handleLinkClick}>Dashboard</Link></li>
            <li><Link to="/DirectoraCambiarNoticias" className={location.pathname === "/DirectoraCambiarNoticias" ? "active" : ""} onClick={handleLinkClick}>Cambiar Noticias</Link></li>
            <li><Link to="/DirectoraAgregarUsuarios" className={location.pathname === "/DirectoraAgregarUsuarios" ? "active" : ""} onClick={handleLinkClick}>Agregar Usuarios</Link></li>
            <li><Link to="/DirectoraVerBoletas" className={location.pathname === "/DirectoraVerBoletas" ? "active" : ""} onClick={handleLinkClick}>Ver Boletas</Link></li>
            <li><Link to="/DirectoraAsignarGrupos" className={location.pathname === "/DirectoraAsignarGrupos" ? "active" : ""} onClick={handleLinkClick}>Asignar Grupos</Link></li>
          </>
        )}

        {userType === 'profesor' && (
          <>
            <li><Link to="/ProfesorDashboard" className={location.pathname === "/ProfesorDashboard" ? "active" : ""} onClick={handleLinkClick}>Dashboard</Link></li>
            <li><Link to="/ProfesorClases" className={location.pathname === "/ProfesorClases" ? "active" : ""} onClick={handleLinkClick}>Mis Clases</Link></li>
            <li><Link to="/ProfesorCalificaciones" className={location.pathname === "/ProfesorCalificaciones" ? "active" : ""} onClick={handleLinkClick}>Ver Calificaciones</Link></li>
            <li><Link to="/ProfesorCaracterizacion" className={location.pathname === "/ProfesorCaracterizacion" ? "active" : ""} onClick={handleLinkClick}>Caracterización</Link></li>
            <li><Link to="/ProfesorAgregarAlumno" className={location.pathname === "/ProfesorAgregarAlumno" ? "active" : ""} onClick={handleLinkClick}>Agregar Alumno</Link></li>
          </>
        )}

        {!user ? (
          <li><Link to="/login" onClick={handleLinkClick}><button className="sign-in-button">Iniciar sesión</button></Link></li>
        ) : (
          <li><button className="sign-out-button" onClick={() => setShowLogoutModal(true)}>Cerrar sesión</button></li>
        )}
      </ul>

      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p>¿Estás seguro de que deseas cerrar sesión?</p>
            <div className="modal-buttons">
              <button onClick={handleLogoutConfirm}>Sí, cerrar sesión</button>
              <button onClick={() => setShowLogoutModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
