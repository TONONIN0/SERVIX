import { useState } from 'react';
import '../styles/Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const cerrarMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">

      {/* LOGO */}
      <a href="/" className="navbar-logo">
        SERVI<span>X</span>
      </a>


      {/* LINKS DESKTOP */}
      <div className="navbar-links">

        <a href="/Servicios">
          Servicios
        </a>

        <a href="/Como-funciona">
          Productos
        </a>

        <a href="/Solicitar">
          Solicitar
        </a>

        <a href="/Contacto">
          Contacto
        </a>

      </div>


      {/* BOTÓN DESKTOP */}
      <a
        href="/registro"
        className="navbar-button"
      >
        Iniciar sesión
      </a>


      {/* BOTÓN HAMBURGUESA */}
      <button
        className={`menu-toggle ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
        aria-expanded={menuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>


      {/* MENÚ MÓVIL */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>

        <a
          href="Servicios"
          onClick={cerrarMenu}
        >
          Servicios
        </a>

        <a
          href="Como-funciona"
          onClick={cerrarMenu}
        >
          Cómo funciona
        </a>

        <a
          href="Solicitar"
          onClick={cerrarMenu}
        >
          Solicitar
        </a>

        <a
          href="Contacto"
          onClick={cerrarMenu}
        >
          Contacto
        </a>


        {/* LOGIN */}
        <a
          href="/registro"
          className="mobile-menu-button"
          onClick={cerrarMenu}
        >
          Iniciar sesión
        </a>

      </div>

    </nav>
  );
}