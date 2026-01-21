import React from 'react';
import Slider from 'react-slick';
import '../styles/Home.css';
import carPrueba from '../assets/carPrueba.jpg';
import carPrueba2 from '../assets/carPrueba1.jpg';
import NoticiasHome from '../components/NoticiasHome';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
  };

  return (
    <>
      <section className="hero-section">
        <Slider {...settings} className="hero-slider">
          <div className="hero-slide">
            <img src={carPrueba} alt="Imagen 1" />
            <div className="hero-overlay">
              <h1>Bienvenidos a la Primaria Dolores Hidalgo</h1>
              <p>Un espacio para crecer, aprender y compartir</p>
            </div>
          </div>
          <div className="hero-slide">
            <img src={carPrueba2} alt="Imagen 2" />
            <div className="hero-overlay">
              <h1>Comunidad Escolar Unida</h1>
              <p>Noticias, eventos y logros de nuestros estudiantes</p>
            </div>
          </div>
          <div className="hero-slide">
            <img src={carPrueba2} alt="Imagen 2" />
            <div className="hero-overlay">
              <h1>Educación con Valores</h1>
              <p>Fomentamos el respeto, la responsabilidad y el esfuerzo</p>
            </div>
          </div>
        </Slider>
      </section>

      <section className="content-section">
        <div className="noticias-fondo-animado">
          
          <NoticiasHome />
        </div>
      </section>
    </>
  );
};

export default Home;
