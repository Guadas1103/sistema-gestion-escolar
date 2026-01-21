import React, { useState } from 'react';
import '../styles/DirectoraCambiarNoticias.css';
import { supabase } from '../services/supabaseClient';
import DirectoraTablaNoticias from './DirectoraTablaNoticias';
import ToastMessage from '../components/ToastMessage';  // Ajusta ruta si es necesario


const DirectoraCambiarNoticias = () => {
  const [seccionActiva, setSeccionActiva] = useState('agregar');

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [fecha, setFecha] = useState('');
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estado para ToastMessage
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

 

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    setImagenFile(file);
    if (file) {
      setImagenPreview(URL.createObjectURL(file));
    } else {
      setImagenPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!titulo || !contenido || !fecha || !imagenFile) {
      setToast({ show: true, message: 'Por favor, completa todos los campos y selecciona una imagen.', type: 'warning' });
      setLoading(false);
      return;
    }

    try {
      // Sanitizar el nombre del archivo
      const timestamp = Date.now();
      const sanitizedFileName = `${timestamp}_${imagenFile.name
        .normalize("NFD")                     // Elimina acentos
        .replace(/[\u0300-\u036f]/g, "")     // Remueve restos de tildes
        .replace(/[^a-zA-Z0-9._-]/g, "_")    // Reemplaza todo lo que no sea alfanumérico o puntos
        }`;

      // Subir imagen a storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('noticias')
        .upload(`imagenes/${sanitizedFileName}`, imagenFile, { upsert: true });

      if (uploadError) throw uploadError;

      // Obtener URL pública de la imagen subida
      const { data: urlData, error: urlError } = supabase.storage
        .from('noticias')
        .getPublicUrl(uploadData.path);

      if (urlError) throw urlError;

      const imagenURL = urlData.publicUrl;

      // Obtener usuario autenticado actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No hay usuario autenticado.');

      // Insertar noticia con autor_id igual al id del usuario autenticado
      const { error: insertError } = await supabase.from('noticias').insert([
        {
          titulo,
          contenido,
          fecha,
          imagen: imagenURL,
          autor_id: user.id,
        },
      ]);
      if (insertError) throw insertError;

      setToast({ show: true, message: 'Noticia subida correctamente.', type: 'success' });

      // Limpiar campos
      setTitulo('');
      setContenido('');
      setFecha('');
      setImagenFile(null);
      setImagenPreview(null);
    } catch (error) {
      setToast({ show: true, message: 'Error al subir la noticia: ' + error.message, type: 'error' });
    }

    setLoading(false);
  };

  return (
    <div className="directora-noticias-container">
      <h2>Noticias</h2>

      {/* Submenú interno */}
      <nav className="directora-noticias-nav">
        <button
          className={seccionActiva === 'agregar' ? 'active' : ''}
          onClick={() => setSeccionActiva('agregar')}
        >
          Nueva Noticia
        </button>
        <button
          className={seccionActiva === 'gestionar' ? 'active' : ''}
          onClick={() => setSeccionActiva('gestionar')}
        >
          Gestionar Noticias
        </button>
      </nav>

      {/* Vista de agregar noticia */}
      {seccionActiva === 'agregar' && (
        <>
          <form onSubmit={handleSubmit} className="noticias-form">
            <div>
              <label>Título:</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Contenido:</label>
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                required
                rows={5}
              />
            </div>

            <div>
              <label>Fecha:</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Imagen:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Subiendo...' : 'Subir Noticia'}
            </button>
          </form>

          {(titulo || contenido || imagenPreview) && (
            <div className="noticia-preview-card">
              {imagenPreview && <img src={imagenPreview} alt="Vista previa" />}
              <h2>{titulo || 'Título de la noticia'}</h2>
              <p>{contenido || 'Contenido de la noticia...'}</p>
              <small>
                Fecha:{" "}
                {fecha
                  ? new Date(fecha).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "No especificada"}
              </small>
            </div>
          )}
        </>
      )}

      {/* Vista de gestión de noticias */}
      {seccionActiva === 'gestionar' && <DirectoraTablaNoticias />}

      {/* ToastMessage para mostrar notificaciones */}
      {toast.show && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      
    </div>
  );
};

export default DirectoraCambiarNoticias;
