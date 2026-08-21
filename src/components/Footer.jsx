import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* INFORMACIÓN PRINCIPAL */}
        <div className="footer-brand">

          <a href="/" className="footer-logo">
            SERVI<span>X</span>
          </a>

          <p>
            La refacción que necesitas.
            <br />
            Cuando la necesitas.
          </p>

          <p className="footer-description">
            Entregas rápidas de refacciones, materiales y
            componentes industriales para mantener tu
            operación en movimiento.
          </p>

        </div>


        {/* NAVEGACIÓN */}
        <div className="footer-column">

          <h3>
            Navegación
          </h3>

          <a href="/">
            Nosotros
          </a>

          <a href="/productos">
            Productos
          </a>

          <a href="/pedidos">
            Mis Solicitudes
          </a>

          <a href="/contacto">
            Contacto
          </a>

        </div>


        {/* CONTACTO */}
        <div className="footer-column">

          <h3>
            Contacto
          </h3>

          <a href="#contacto">
            Contáctanos
          </a>

          <a href="mailto:contacto@servix.com">
            contacto@servix.com
          </a>

          <a href="tel:+523337803251">
            +52 33 3780 3251
          </a>

        </div>


        
      </div>


      {/* PARTE INFERIOR */}

      <div className="footer-bottom">

        <p>
          © 2026 SERVIX. Todos los derechos reservados.
        </p>

        <div className="footer-legal">

          <a href="#">
            Aviso de privacidad
          </a>

          <a href="#">
            Términos y condiciones
          </a>

        </div>

      </div>

    </footer>
  );
}