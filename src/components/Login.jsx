import { useState } from 'react';
import '../styles/Login.css';

export default function Login() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Correo o contraseña incorrectos');
        return;
      }

      console.log('Login correcto:', data);

      // Después podemos redirigir al dashboard
      window.location.href = '/';

    } catch (error) {
      console.error(error);
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      <div className="login-background">
        <div className="login-glow"></div>
      </div>

      <section className="login-container">

        {/* LOGO */}

        <a href="/" className="login-logo">
          SERVI<span>X</span>
        </a>


        {/* CARD */}

        <div className="login-card">

          <div className="login-header">

            <span className="login-label">
              ACCESO
            </span>

            <h1>
              Bienvenido
              <span> de nuevo.</span>
            </h1>

            <p>
              Inicia sesión para acceder a tu cuenta SERVIX.
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            {/* EMAIL */}

            <div className="input-group">

              <label htmlFor="email">
                Correo electrónico
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="tu@empresa.com"
                value={form.email}
                onChange={handleChange}
                required
              />

            </div>


            {/* PASSWORD */}

            <div className="input-group">

              <div className="password-label">

                <label htmlFor="password">
                  Contraseña
                </label>

                <a href="#">
                  ¿La olvidaste?
                </a>

              </div>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />

            </div>


            {/* ERROR */}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}


            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>

          </form>


          {/* REGISTER */}

          <div className="login-register">

            <span>
              ¿Aún no tienes una cuenta?
            </span>

            <a href="/registro">
              Crear cuenta
            </a>

          </div>

        </div>


        {/* FOOTER */}

        <div className="login-footer">

          <span className="login-status"></span>

          SERVIX · LOGÍSTICA INDUSTRIAL

        </div>

      </section>

    </main>
  );
}