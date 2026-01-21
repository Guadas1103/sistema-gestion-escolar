import React, { useContext } from 'react';  // <-- importa useContext
import { Route, Routes, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Nosotros from './pages/About';
import Informacion from './pages/Info';
import Contacto from './pages/Contact';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import SuperUserDashboard from './pages/SuperUserDashboard';
import SuperUserGestionarUsuarios from './pages/SuperUserGestionarUsuarios';
import SuperUserModificarPlataforma from './pages/SuperUserModificarPlataforma';
import DirectoraDashboard from './pages/DirectoraDashboard';
import DirectoraCambiarNoticias from './pages/DirectoraCambiarNoticias';
import DirectoraAgregarUsuarios from './pages/DirectoraAgregarUsuarios';
import DirectoraVerBoletas from './pages/DirectoraVerBoletas';
import DirectoraAsignarGrupos from './pages/DirectoraAsignarGrupos';
import ProfesorDashboard from './pages/ProfesorDashboard';
import ProfesorClases from './pages/ProfesorClases';
import ProfesorCalificaciones from './pages/ProfesorCalificaciones';
import ProfesorCaracterizacion from './pages/ProfesorCaracterizacion';
import ProfesorAgregarAlumno from './pages/ProfesorAgregarAlumno';

import { AuthContext } from './context/AuthContext';  // <-- importa AuthContext
import './styles/global.css';

const PrivateRoute = ({ element, requiredRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // Mientras carga el usuario, no renderices nada o muestra un loader
    return <div>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.userType !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return element;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/informacion" element={<Informacion />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas según el tipo de usuario */}
        <Route path="/SuperUserDashboard" element={<PrivateRoute element={<SuperUserDashboard />} requiredRole="superusuario" />} />
        <Route path="/SuperUserGestionarUsuarios" element={<PrivateRoute element={<SuperUserGestionarUsuarios />} requiredRole="superusuario" />} />
        <Route path="/SuperUserModificarPlataforma" element={<PrivateRoute element={<SuperUserModificarPlataforma />} requiredRole="superusuario" />} />

        <Route path="/DirectoraDashboard" element={<PrivateRoute element={<DirectoraDashboard />} requiredRole="directora" />} />
        <Route path="/DirectoraCambiarNoticias" element={<PrivateRoute element={<DirectoraCambiarNoticias />} requiredRole="directora" />} />
        <Route path="/DirectoraAgregarUsuarios" element={<PrivateRoute element={<DirectoraAgregarUsuarios />} requiredRole="directora" />} />
        <Route path="/DirectoraVerBoletas" element={<PrivateRoute element={<DirectoraVerBoletas />} requiredRole="directora" />} />
        <Route path="/DirectoraAsignarGrupos" element={<PrivateRoute element={<DirectoraAsignarGrupos />} requiredRole="directora" />} />

        <Route path="/ProfesorDashboard" element={<PrivateRoute element={<ProfesorDashboard />} requiredRole="profesor" />} />
        <Route path="/ProfesorClases" element={<PrivateRoute element={<ProfesorClases />} requiredRole="profesor" />} />
        <Route path="/ProfesorCalificaciones" element={<PrivateRoute element={<ProfesorCalificaciones />} requiredRole="profesor" />} />
        <Route path="/ProfesorCaracterizacion" element={<PrivateRoute element={<ProfesorCaracterizacion />} requiredRole="profesor" />} />
        <Route path="/ProfesorAgregarAlumno" element={<PrivateRoute element={<ProfesorAgregarAlumno />} requiredRole="profesor" />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
