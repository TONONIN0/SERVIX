import { useState, useEffect } from 'react';
import '../styles/Navbar.css';

export default function Navbar({ usuario = null }) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);


  // =========================
  // CERRAR MENÚ MÓVIL
  // =========================

  const cerrarMenu = () => {
    setMenuOpen(false);
  };


  // =========================
  // CERRAR SESIÓN
  // =========================

  const cerrarSesion = async () => {

    try {

      await fetch('/api/logout', {
        method: 'POST',
      });

      window.location.href = '/login';

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

    // Si no hay usuario,
    // no necesitamos consultar el carrito

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


      // =========================
      // SUMAR CANTIDADES
      // =========================

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
  // CARGAR AL INICIAR
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

        actualizarCarrito();

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

  }, [usuario]);


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
          ZONA DERECHA DESKTOP
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
                    .charAt(0)
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


              {/* =========================
                  MENÚ PERFIL
              ========================= */}

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
                CARRITO DESKTOP
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


          /* =========================
             USUARIO NO LOGUEADO
          ========================= */

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
          onClick={
            cerrarMenu
          }
        >

          Servicios

        </a>


        <a
          href="/productos"
          onClick={
            cerrarMenu
          }
        >

          Productos

        </a>


        <a
          href="/Solicitar"
          onClick={
            cerrarMenu
          }
        >

          Solicitar

        </a>


        <a
          href="/Contacto"
          onClick={
            cerrarMenu
          }
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
              onClick={
                cerrarMenu
              }
            >

              👤 {usuario.nombre}

            </a>


            <a
              href="/carrito"
              onClick={
                cerrarMenu
              }
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
              onClick={
                cerrarSesion
              }
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
            onClick={
              cerrarMenu
            }
          >

            Iniciar sesión

          </a>

        )}

      </div>

    </nav>

  );

}
