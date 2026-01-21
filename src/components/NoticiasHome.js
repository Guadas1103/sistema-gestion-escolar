import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import '../styles/NoticiasHome.css'; // Asegúrate que exista y contenga el CSS correcto

const NoticiasHome = () => {
  const [noticias, setNoticias] = useState([]);

  useEffect(() => {
    const fetchNoticias = async () => {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error al cargar noticias:', error.message);
      } else {
        setNoticias(data);
      }
    };

    fetchNoticias();
  }, []);

  return (
    <div className="noticias-home-section">
      <h2 className="noticias-home-title">Últimas Noticias</h2>
      <div className="noticias-home-cards">
        {noticias.map((noticia) => (
          <div key={noticia.id} className="noticia-preview-card">
            <img src={noticia.imagen} alt={noticia.titulo} />
            <h2>{noticia.titulo}</h2>
            <p>{noticia.contenido}</p>
            <small>
              {new Date(noticia.fecha).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticiasHome;
