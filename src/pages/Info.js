import React from 'react';
import '../styles/Info.css';

const Informacion = () => {
  return (
    <div className="info-container">
      <div className="info-card">
        <h1>Información de Contacto</h1>
        <p><strong>Dirección:</strong> Av. de Los Dolores, 61135 Cdad. Hidalgo, Mich.</p>
        <p><strong>Teléfono:</strong> (418) 123 4567</p>

        <div className="map-container">
          <iframe
            title="Ubicación"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d905.6569845369517!2d-100.57693995962204!3d19.67710700014615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d2cb3a744a740d%3A0x523e5989387a9169!2sColegio%20Dolores%20Hidalgo!5e1!3m2!1ses-419!2smx!4v1750829964299!5m2!1ses-419!2smx"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Informacion;