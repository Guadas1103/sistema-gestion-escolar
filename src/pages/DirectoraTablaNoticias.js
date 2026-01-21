import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import '../styles/DirectoraTablaNoticias.css';
import ToastMessage from '../components/ToastMessage'; // Ajusta ruta
import ConfirmModal from '../components/ConfirmModal'; // Ajusta ruta

const PAGE_SIZE = 10; // Cantidad de noticias por página

const DirectoraTablaNoticias = () => {
  const [noticias, setNoticias] = useState([]);
  const [modalNoticia, setModalNoticia] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalNoticias, setTotalNoticias] = useState(0);

  // Estados para Toast y ConfirmModal
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [noticiaAEliminar, setNoticiaAEliminar] = useState(null);

  const fetchNoticias = async (pagina = 1) => {
    const from = (pagina - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Traemos total para paginación
    const { count, error: countError } = await supabase
      .from('noticias')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      setToast({ show: true, message: 'Error al contar noticias: ' + countError.message, type: 'error' });
      return;
    }

    setTotalNoticias(count);

    const { data, error } = await supabase
      .from('noticias')
      .select('*')
      .order('fecha', { ascending: false })
      .range(from, to);

    if (error) {
      setToast({ show: true, message: 'Error al cargar noticias: ' + error.message, type: 'error' });
    } else {
      setNoticias(data);
    }
  };

  useEffect(() => {
    fetchNoticias(paginaActual);
  }, [paginaActual]);

  // Función para abrir modal confirmación con noticia seleccionada
  const abrirConfirmEliminar = (noticia) => {
    setNoticiaAEliminar(noticia);
    setConfirmOpen(true);
  };

  // Función que elimina realmente la noticia, llamada después de confirmar
  const confirmarEliminar = async () => {
    if (!noticiaAEliminar || eliminando) return;

    setEliminando(true);
    setConfirmOpen(false);

    const { id, imagen } = noticiaAEliminar;

    try {
      if (imagen) {
        const url = new URL(imagen);
        const pathIndex = url.pathname.indexOf('/noticias/');
        let fileKey = null;
        if (pathIndex !== -1) {
          fileKey = url.pathname.substring(pathIndex + '/noticias/'.length);
        }

        if (fileKey) {
          const { error: storageError } = await supabase.storage
            .from('noticias')
            .remove([fileKey]);

          if (storageError) {
            setToast({ show: true, message: 'Error al eliminar la imagen del storage: ' + storageError.message, type: 'error' });
            setEliminando(false);
            return;
          }
        }
      }

      const { error } = await supabase.from('noticias').delete().eq('id', id);
      if (error) {
        setToast({ show: true, message: 'Error al eliminar la noticia: ' + error.message, type: 'error' });
      } else {
        setToast({ show: true, message: 'Noticia eliminada correctamente', type: 'success' });
        // Si se elimina la última noticia de la página y no hay más, retrocedemos una página
        const paginasTotales = Math.ceil((totalNoticias - 1) / PAGE_SIZE);
        if (paginaActual > paginasTotales) setPaginaActual(paginasTotales);
        else fetchNoticias(paginaActual);
      }
    } catch (error) {
      setToast({ show: true, message: 'Error inesperado: ' + error.message, type: 'error' });
    }

    setEliminando(false);
    setNoticiaAEliminar(null);
  };

  const paginasTotales = Math.ceil(totalNoticias / PAGE_SIZE);

  return (
    <div className="directora-usuarios-container">
      <h1>Lista de Noticias</h1>
      <table className="noticias-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {noticias.map((noticia) => {
            const fechaFormateada = new Date(noticia.fecha).toLocaleDateString();

            return (
              <tr key={noticia.id}>
                <td>{noticia.titulo}</td>
                <td>{fechaFormateada}</td>
                <td>
                  <button
                    className="btn btn-small"
                    onClick={() => setModalNoticia(noticia)}
                  >
                    Ver
                  </button>
                  <button
                    className="btn btn-small"
                    onClick={() => abrirConfirmEliminar(noticia)}
                    disabled={eliminando}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Controles de paginación */}
      <div className="pagination">
        <button
          disabled={paginaActual === 1}
          onClick={() => setPaginaActual(paginaActual - 1)}
        >
          Anterior
        </button>
        <span>
          Página {paginaActual} de {paginasTotales || 1}
        </span>
        <button
          disabled={paginaActual === paginasTotales || paginasTotales === 0}
          onClick={() => setPaginaActual(paginaActual + 1)}
        >
          Siguiente
        </button>
      </div>

      {modalNoticia && (
        <div className="modal-backdrop" onClick={() => setModalNoticia(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modalNoticia.titulo}</h2>
            <p>
              <strong>Fecha:</strong> {new Date(modalNoticia.fecha).toLocaleDateString()}
            </p>
            {modalNoticia.imagen && (
              <img
                src={modalNoticia.imagen}
                alt="Imagen de la noticia"
                style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '1rem' }}
              />
            )}
            <p>{modalNoticia.descripcion}</p>
            <div className="modal-buttons">
              <button className="btn" onClick={() => setModalNoticia(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ToastMessage para notificaciones */}
      {toast.show && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* ConfirmModal para confirmar eliminación */}
      <ConfirmModal
        isOpen={confirmOpen}
        message="¿Seguro que quieres eliminar esta noticia?"
        onConfirm={confirmarEliminar}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default DirectoraTablaNoticias;
