import React, { useState } from 'react';
import '../styles/Contact.css';

const Contacto = () => {
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    mensaje: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', form);
    alert('Mensaje enviado correctamente (simulado).');
    setForm({ nombre: '', correo: '', mensaje: '' });
  };

  return (
    <div className="contact-container">
      <div className="contact-card">
        <h1>Contacto</h1>
        <p>¿Tienes preguntas? ¡Contáctanos y estaremos felices de ayudarte!</p>

        <div className="faq-section">
          <h2>Preguntas Frecuentes</h2>
          <div className="faq-item">
            <strong>¿Cuándo son las inscripciones?</strong>
            <p>Las inscripciones se realizan durante el mes de agosto. Publicamos las fechas exactas en nuestras redes sociales y sitio web.</p>
          </div>
          <div className="faq-item">
            <strong>¿Qué documentos necesito para inscribir a mi hijo/a?</strong>
            <p>Acta de nacimiento, CURP, comprobante de domicilio, y certificado médico.</p>
          </div>
          <div className="faq-item">
            <strong>¿Cuál es el horario escolar?</strong>
            <p>El horario es de lunes a viernes de 8:00 a.m. a 2:00 p.m.</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombre"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="correo"
            placeholder="Tu correo electrónico"
            value={form.correo}
            onChange={handleChange}
            required
          />
          <textarea
            name="mensaje"
            placeholder="Tu mensaje"
            rows="5"
            value={form.mensaje}
            onChange={handleChange}
            required
          />
          <button type="submit">Enviar mensaje</button>
        </form>
      </div>
    </div>
  );
};

export default Contacto;
