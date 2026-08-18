import { useState, useEffect } from 'react';
import '../styles/Navbar.css';

export default function Navbar({ usuario: usuarioInicial = null }) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [usuario, setUsuario] =
    useState(usuarioInicial);

  const [cartCount, setCartCount] =
    useState(0);


  // =========================
  // CERRAR MENÚ MÓVIL
  // =========================

  const cerrarMenu = () => {

    setMenuOpen(false);

  };


  // =========================
  // CARGAR USUARIO
  // =========================

  const cargarUsuario = async () => {

    try {

      const response =
        await fetch('/api/me');


      if (!response.ok) {

        setUsuario(null);

        return;

      }


      const data =
        await response.json();


      if (
        data.authenticated &&
        data.user
      ) {

        setUsuario(data.user);

      } else {

        setUsuario(null);

      }

    } catch (error) {

      console.error(
        'Error cargando usuario:',
        error
      );

      setUsuario(null);

    }

  };


  // =========================
  // CERRAR SESIÓN
  // =========================

  const cerrarSesion = async () => {

    try {

      await fetch('/api/logout', {
        method: 'POST',
      });

      setUsuario(null);

      window.location.href =
        '/login';

    } catch (error) {

      console.error(
        'Error al cerrar sesión:',
        error
      );

    }

  };


  // =========================
  // CARGAR CARRITO
  // =========================

  const actualizarCarrito = async () => {

    if (!usuario) {

      setCartCount(0);

      return;

    }


    try {

      const response =
        await fetch('/api/cart');


      if (!response.ok) {

        setCartCount(0);

        return;

      }


      const data =
        await response.json();


      if (
        !data.success ||
        !data.cart
      ) {

        setCartCount(0);

        return;

      }


      const cantidad =
        data.cart.items.reduce(
          (total, item) => {

            return total + item.cantidad;

          },
          0
        );


      setCartCount(cantidad);

    } catch (error) {

      console.error(
        'Error cargando carrito:',
        error
      );

      setCartCount(0);

    }

  };


  // =========================
  // CARGAR SESIÓN AL INICIAR
  // =========================

  useEffect(() => {

    if (usuarioInicial) {

      setUsuario(usuarioInicial);

      return;

    }

    cargarUsuario();

  }, []);


  // =========================
  // ACTUALIZAR CARRITO
  // =========================

  useEffect(() => {

    actualizarCarrito();

  }, [usuario]);


  // =========================
  // ACTUALIZAR AL VOLVER
  // =========================

  useEffect(() => {

    const actualizarCuandoRegresa =
      () => {

        cargarUsuario();

      };


    window.addEventListener(
      'focus',
      actualizarCuandoRegresa
    );


    return () => {

      window.removeEventListener(
        'focus',
        actualizarCuandoRegresa
      );

    };

  }, []);


  // =========================
  // RENDER
  // =========================

  return (

    <nav className="navbar">


      {/* =========================
          LOGO
      ========================= */}

      <a
        href="/"
        className="navbar-logo"
      >

        SERVI<span>X</span>

      </a>


      {/* =========================
          LINKS DESKTOP
      ========================= */}

      <div className="navbar-links">

        <a href="/Servicios">
          Servicios
        </a>

        <a href="/productos">
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
          ZONA DERECHA
      ========================= */}

      <div className="navbar-user-area">


        {usuario ? (

          <>


            {/* =========================
                PERFIL
            ========================= */}

            <div className="profile-container">

              <button
                className="navbar-user"
                onClick={() =>
                  setProfileOpen(
                    !profileOpen
                  )
                }
                aria-expanded={profileOpen}
              >

                <span className="user-icon">

                  {usuario.nombre
                    ?.charAt(0)
                    .toUpperCase()}

                </span>


                <span className="user-name">

                  {usuario.nombre}

                </span>


                <span
                  className={`profile-arrow ${
                    profileOpen
                      ? 'open'
                      : ''
                  }`}
                >

                  ▾

                </span>

              </button>


              {profileOpen && (

                <div
                  className="profile-dropdown"
                >

                  <a href="/perfil">
                    👤 Mi perfil
                  </a>


                  <a href="/carrito">
                    🛒 Carrito
                  </a>


                  <div
                    className="profile-divider"
                  ></div>


                  <button
                    className="logout-button"
                    onClick={
                      cerrarSesion
                    }
                  >

                    Cerrar sesión

                  </button>

                </div>

              )}

            </div>


            {/* =========================
                CARRITO
            ========================= */}

            <a
              href="/carrito"
              className="navbar-cart"
              aria-label="Carrito"
            >

              🛒

              <span className="cart-count">
                {cartCount}
              </span>

            </a>

          </>

        ) : (

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
          menuOpen
            ? 'active'
            : ''
        }`}
        onClick={() =>
          setMenuOpen(
            !menuOpen
          )
        }
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
          menuOpen
            ? 'open'
            : ''
        }`}
      >

        <a
          href="/Servicios"
          onClick={cerrarMenu}
        >
          Servicios
        </a>


        <a
          href="/productos"
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

              {cartCount > 0 && (

                <span
                  className="mobile-cart-count"
                >
                  {cartCount}
                </span>

              )}

            </a>


            <button
              className="mobile-logout"
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </button>

          </>

        ) : (

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

