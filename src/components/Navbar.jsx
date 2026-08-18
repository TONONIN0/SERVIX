import { useState, useEffect, useCallback } from 'react';
import '../styles/Navbar.css';

export default function Navbar({ usuario: usuarioInicial = null }) {

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [usuario, setUsuario] =
    useState(usuarioInicial);

  const [cartCount, setCartCount] =
    useState(0);

  const [sessionLoading, setSessionLoading] =
    useState(!usuarioInicial);


  // =========================
  // CERRAR MENÚ
  // =========================

  const cerrarMenu = () => {

    setMenuOpen(false);
    setProfileOpen(false);

  };


  // =========================
  // CARGAR USUARIO
  // =========================

  const cargarUsuario = useCallback(async () => {

    try {

      const response =
        await fetch('/api/me', {
          credentials: 'same-origin',
        });


      if (!response.ok) {

        setUsuario(null);
        setCartCount(0);

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
        setCartCount(0);

      }

    } catch (error) {

      console.error(
        'Error cargando usuario:',
        error
      );

      setUsuario(null);
      setCartCount(0);

    } finally {

      setSessionLoading(false);

    }

  }, []);


  // =========================
  // CERRAR SESIÓN
  // =========================

  const cerrarSesion = async () => {

    try {

      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });

      setUsuario(null);
      setCartCount(0);
      setProfileOpen(false);
      setMenuOpen(false);

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

  const actualizarCarrito = useCallback(async () => {

    if (!usuario) {

      setCartCount(0);

      return;

    }


    try {

      const response =
        await fetch('/api/cart', {
          credentials: 'same-origin',
          cache: 'no-store',
        });


      if (!response.ok) {

        setCartCount(0);

        return;

      }


      const data =
        await response.json();


      if (
        !data.success ||
        !data.cart ||
        !Array.isArray(data.cart.items)
      ) {

        setCartCount(0);

        return;

      }


      const cantidad =
        data.cart.items.reduce(
          (total, item) => {

            return total +
              Number(item.cantidad || 0);

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

  }, [usuario]);


  // =========================
  // CARGAR SESIÓN AL INICIAR
  // =========================

  useEffect(() => {

    if (usuarioInicial) {

      setUsuario(usuarioInicial);
      setSessionLoading(false);

      return;

    }

    cargarUsuario();

  }, [
    usuarioInicial,
    cargarUsuario
  ]);


  // =========================
  // CARGAR CARRITO
  // =========================

  useEffect(() => {

    if (!usuario) {

      setCartCount(0);

      return;

    }

    actualizarCarrito();

  }, [
    usuario,
    actualizarCarrito
  ]);


  // =========================
  // ACTUALIZAR CARRITO
  // AUTOMÁTICAMENTE
  // =========================

  useEffect(() => {

    if (!usuario) {
      return;
    }


    /*
      Actualiza el contador periódicamente.

      Esto permite que cuando agregues,
      elimines o cambies cantidades en el
      carrito, el número del Navbar se
      actualice automáticamente.
    */

    const intervalo =
      setInterval(() => {

        actualizarCarrito();

      }, 1000);


    return () => {

      clearInterval(intervalo);

    };

  }, [
    usuario,
    actualizarCarrito
  ]);


  // =========================
  // ACTUALIZAR AL VOLVER
  // =========================

  useEffect(() => {

    const actualizarCuandoRegresa = () => {

      cargarUsuario();

      if (usuario) {

        actualizarCarrito();

      }

    };


    window.addEventListener(
      'focus',
      actualizarCuandoRegresa
    );


    window.addEventListener(
      'pageshow',
      actualizarCuandoRegresa
    );


    return () => {

      window.removeEventListener(
        'focus',
        actualizarCuandoRegresa
      );

      window.removeEventListener(
        'pageshow',
        actualizarCuandoRegresa
      );

    };

  }, [
    usuario,
    cargarUsuario,
    actualizarCarrito
  ]);


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

        <a href="/pedidos">
          Mis solicitudes
        </a>

        <a href="/Contacto">
          Contacto
        </a>

      </div>


      {/* =========================
          ZONA DERECHA
      ========================= */}

      <div className="navbar-user-area">


        {/* =========================
            CARGANDO SESIÓN
        ========================= */}

        {sessionLoading ? (

          <div
            className="navbar-session-loading"
            aria-hidden="true"
          ></div>

        ) : usuario ? (

          <>


            {/* =========================
                PERFIL
            ========================= */}

            <div className="profile-container">

              <button
                type="button"
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


              {/* =========================
                  DROPDOWN
              ========================= */}

              {profileOpen && (

                <div className="profile-dropdown">


                  {/* PERFIL */}

                  <a href="/perfil">

                    <img
                      src="/assets/perfil.avif"
                      alt=""
                      className="profile-menu-icon"
                    />

                    <span>
                      Mi perfil
                    </span>

                  </a>


                  {/* CARRITO */}

                  <a href="/carrito">

                    <img
                      src="/assets/carrito.avif"
                      alt=""
                      className="profile-menu-icon"
                    />

                    <span>
                      Carrito
                    </span>

                  </a>


                  {/* SOLICITUDES */}

                  <a href="/pedidos">

                    <img
                      src="/assets/entrega.avif"
                      alt=""
                      className="profile-menu-icon"
                    />

                    <span>
                      Mis solicitudes
                    </span>

                  </a>


                  <div className="profile-divider"></div>


                  {/* CERRAR SESIÓN */}

                  <button
                    type="button"
                    className="logout-button"
                    onClick={cerrarSesion}
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

              <img
                src="/assets/carrito.avif"
                alt="Carrito"
                className="navbar-cart-icon"
              />


              {cartCount > 0 && (

                <span className="cart-count">

                  {cartCount}

                </span>

              )}

            </a>

          </>

        ) : (


          /* =========================
             NO LOGUEADO
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
        type="button"
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
          href="/pedidos"
          onClick={cerrarMenu}
        >

          Mis solicitudes

        </a>


        <a
          href="/Contacto"
          onClick={cerrarMenu}
        >

          Contacto

        </a>


        {/* =========================
            USUARIO MÓVIL
        ========================= */}

        {sessionLoading ? (

          <div
            className="mobile-session-loading"
            aria-hidden="true"
          ></div>

        ) : usuario ? (

          <>


            {/* PERFIL */}

            <a
              href="/perfil"
              className="mobile-user"
              onClick={cerrarMenu}
            >

              <img
                src="/assets/perfil.avif"
                alt=""
                className="mobile-menu-icon"
              />

              <span>
                {usuario.nombre}
              </span>

            </a>


            {/* CARRITO */}

            <a
              href="/carrito"
              className="mobile-menu-item"
              onClick={cerrarMenu}
            >

              <img
                src="/assets/carrito.avif"
                alt=""
                className="mobile-menu-icon"
              />

              <span>
                Carrito
              </span>


              {cartCount > 0 && (

                <span className="mobile-cart-count">

                  {cartCount}

                </span>

              )}

            </a>


            {/* SOLICITUDES */}

            <a
              href="/pedidos"
              className="mobile-menu-item"
              onClick={cerrarMenu}
            >

              <img
                src="/assets/entrega.avif"
                alt=""
                className="mobile-menu-icon"
              />

              <span>
                Mis solicitudes
              </span>

            </a>


            {/* CERRAR SESIÓN */}

            <button
              type="button"
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