import React from 'react';
import '../styles/About.css';
import logo from '../assets/logo.jpg';

const Nosotros = () => {
  const info = {
    titulo: "Quiénes Somos",
    descripcion: "Somos una empresa innovadora, dedicada a brindar las mejores soluciones a nuestros clientes. Desde 2005, hemos trabajado para ofrecer productos de alta calidad en diversas industrias.",
    imagen: logo
  };

  return (
    <div className="about-container">
      {/* Sección Quiénes Somos */}
      <div className="about-section">
        <h1>{info.titulo}</h1>
        <img src={info.imagen} alt="Nosotros" className="about-image" />
        <p>{info.descripcion}</p>
      </div>

      {/* Sección Visión */}
      <div className="about-section">
        <h2>Visión</h2>
        <p>
          La visión de nuestro colegio es proyectar a la sociedad como un centro educativo que tiene como finalidad
          elevar el nivel educativo, cultural, humanista para instruir y formar a los educandos en su desarrollo
          físico, intelectual, social y moral para adquirir una educación integral basada en su dignidad como
          personas creando un ambiente donde el alumnos sea crítico, reflexivo, analítico para enfrentar al futuro
          con nuevas propuestas y soluciones.
        </p>
      </div>

      {/* Sección Misión */}
      <div className="about-section">
        <h2>Misión</h2>
        <p>
          La misión  de la escuela “ Dolores  Hidalgo “ es elevar la calidad educativa de los alumnos ,
          brindándoles un desarrollo integral , donde el proceso de enseñanza – aprendizaje sea enriquecido
          por diversas  estrategias que favorezcan de manera significativa los conocimientos por lo que el
          docente debe actualizarse para ser un facilitador y guía que brinde las herramientas necesarias
          para formar y educar niños con metas críticas , reflexivas , analíticas y lógicas , para un buen
          desenvolvimiento en y para la vida, para que sean libres e independientes.
        </p>
      </div>

      {/* Sección Valores */}
      <div className="about-section">
        <h2>Valores</h2>
        <p>
          Para lograr que nuestro colegio marche de una manera adecuada y cumpla con los estándares educativos,
          pretendemos que en nuestra escuela predomine la responsabilidad, el respeto, la convivencia, la honestidad,
          la limpieza, la tolerancia y la colaboración. Lo cual para nosotros es fundamental inculcar en los
          estudiantes estos valores tan necesarios para la vida y para enfrentarse a una sociedad y dar testimonio en
          ella.
        </p>
      </div>


      {/* Sección Objetivos */}
      <div className="about-section">
        <h2>Objetivos</h2>
        <p>
          Contribuir con la calidad de la formación de los alumnos, fortaleciendo sus conocimientos, habilidades,
          destrezas actitudes y aptitudes que coadyuven a sus  necesidades y les permita ser autónomos,
          responsables, innovadores, reflexivos y con una visión amplia.
          Que el colegio Dolores Hidalgo sea portador de nuestra cultura y nuestra raíces, creando alumnos más 
          consientes, comprometidos con la familia, con la patria y con  DIOS.

        </p>
      </div>
    </div>
  );
};

export default Nosotros;

