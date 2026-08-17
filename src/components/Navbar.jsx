import { useState } from 'react';
import '../styles/Navbar.css';

export default function Navbar({ usuario = null }) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const cerrarMenu = () => {
    setMenuOpen(false);
  };

  const cerrarSesion = async () => {

    try {

      await fetch('/api/logout', {
        method: 'POST',
      });

      window.location.href = '/login';

    } catch (error) {

      console.error('Error al cerrar sesión:', error);

    }

  };

  return (

    <nav className="navbar">

      {/* =========================
          LOGO
      ========================= */}

      <a href="/" className="navbar-logo">
        SERVI<span>X</span>
      </a>


      {/* =========================
          LINKS DESKTOP
      ========================= */}

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


      {/* =========================
          ZONA DERECHA DESKTOP
      ========================= */}

      <div className="navbar-user-area">

        {usuario ? (

          <>

            {/* PERFIL */}

            <div className="profile-container">

              <button
                className="navbar-user"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
              >

                <span className="user-icon">
                  {usuario.nombre.charAt(0).toUpperCase()}
                </span>

                <span className="user-name">
                  {usuario.nombre}
                </span>

                <span
                  className={`profile-arrow ${
                    profileOpen ? 'open' : ''
                  }`}
                >
                  ▾
                </span>

              </button>


              {/* MENÚ PERFIL */}

              {profileOpen && (

                <div className="profile-dropdown">

                  <a href="/perfil">
                    👤 Mi perfil
                  </a>

                  <a href="/carrito">
                    🛒 Carrito
                  </a>

                  <div className="profile-divider"></div>

                  <button
                    className="logout-button"
                    onClick={cerrarSesion}
                  >
                    Cerrar sesión
                  </button>

                </div>

              )}

            </div>


            {/* CARRITO DESKTOP */}

            <a
              href="/carrito"
              className="navbar-cart"
              aria-label="Carrito"
            >

              🛒

              <span className="cart-count">
                0
              </span>

            </a>

          </>

        ) : (

          /* USUARIO NO LOGUEADO */

          <a
            href="/login"
            className="navbar-button"
          >
            Iniciar sesión
          </a>

        )}

      </div>


      {/* =========================
          HAMBURGUESA
      ========================= */}

      <button
        className={`menu-toggle ${
          menuOpen ? 'active' : ''
        }`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
        aria-expanded={menuOpen}
      >

        <span></span>
        <span></span>
        <span></span>

      </button>


      {/* =========================
          MENÚ MÓVIL
      ========================= */}

      <div
        className={`mobile-menu ${
          menuOpen ? 'open' : ''
        }`}
      >

        <a
          href="/Servicios"
          onClick={cerrarMenu}
        >
          Servicios
        </a>

        <a
          href="/Como-funciona"
          onClick={cerrarMenu}
        >
          Productos
        </a>

        <a
          href="/Solicitar"
          onClick={cerrarMenu}
        >
          Solicitar
        </a>

        <a
          href="/Contacto"
          onClick={cerrarMenu}
        >
          Contacto
        </a>


        {/* =========================
            USUARIO LOGUEADO
        ========================= */}

        {usuario ? (

          <>

            <a
              href="/perfil"
              className="mobile-user"
              onClick={cerrarMenu}
            >
              👤 {usuario.nombre}
            </a>


            <a
              href="/carrito"
              onClick={cerrarMenu}
            >
              🛒 Carrito
            </a>


            <button
              className="mobile-logout"
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </button>

          </>

        ) : (

          /* =========================
             NO LOGUEADO
          ========================= */

          <a
            href="/login"
            className="mobile-menu-button"
            onClick={cerrarMenu}
          >
            Iniciar sesión
          </a>

        )}

      </div>

    </nav>

  );
}