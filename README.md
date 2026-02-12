# Sistema de Gestión Escolar – Primaria Dolores Hidalgo

Proyecto escolar desarrollado como sistema web para la **gestión académica y administrativa** de una escuela primaria, enfocado en la digitalización de procesos escolares.

## 🏫 Descripción
El sistema permite administrar usuarios, alumnos, calificaciones y boletas escolares, con control de acceso basado en roles.  
Está diseñado para facilitar el trabajo de directivos y docentes, así como mejorar la organización de la información académica.

## 👥 Roles del sistema
- **Superusuario**
  - Gestión de usuarios del sistema
- **Directora**
  - Administración de usuarios
  - Gestión de noticias escolares
  - Generación y consulta de boletas
- **Profesor**
  - Registro y consulta de calificaciones
  - Caracterización de alumnos
  - Visualización de boletas

## ✨ Funcionalidades principales
- Autenticación y autorización con Supabase Auth
- Gestión de alumnos y profesores
- Registro de calificaciones mensuales y trimestrales
- Cálculo automático de promedios
- Generación de boletas en formato PDF
- Caracterización del alumno (observaciones, apoyos, semáforo emocional)
- Gestión de noticias visibles en el inicio del sistema

## 🛠 Tecnologías utilizadas
- **React (Create React App)**
- **JavaScript**
- **Supabase**
  - Auth
  - Base de datos PostgreSQL
  - Row Level Security (RLS)
- **CSS**
- **jsPDF**

## 🔐 Seguridad
- Uso de variables de entorno para credenciales
- Políticas RLS para proteger el acceso a los datos
- Separación de permisos por rol de usuario

## 🗄 Base de datos
La aplicación utiliza **Supabase (PostgreSQL)** como base de datos y sistema de autenticación.

### Tablas principales
- **usuarios**
  - user_id
  - nombre
  - email
  - user_type (superusuario, directora, profesor)
- **alumnos**
- **grupos**
- **materias**
- **calificaciones**
- **periodos**

Las relaciones entre tablas permiten asociar alumnos con grupos, materias y periodos académicos.

> Nota: Por motivos de seguridad y privacidad, la base de datos y los datos reales no se incluyen en este repositorio.

## 📂 Estructura del proyecto
src/
├─ assets/
├─ components/
├─ context/
├─ hooks/
├─ pages/
├─ services/
├─ styles/
├─ utils/



## 👩‍💻 Autor
Guadas Domínguez  
Proyecto académico – Desarrollo web