import { useState } from 'react';

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [correoNoVerificado, setCorreoNoVerificado] = useState(false);


  const iniciarSesion = async (e) => {

    e.preventDefault();

    setError('');
    setCorreoNoVerificado(false);
    setLoading(true);

    try {

      const response = await fetch('/api/login', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();


      // =========================
      // CORREO NO VERIFICADO
      // =========================

      if (response.status === 403) {

        localStorage.setItem(
          'servix_verification_email',
          data.email || email.toLowerCase().trim()
        );

        setError(
          data.error ||
          'Debes verificar tu correo antes de iniciar sesión.'
        );

        setCorreoNoVerificado(true);

        return;
      }


      // =========================
      // OTROS ERRORES
      // =========================

      if (!response.ok) {

        setError(
          data.error ||
          'No se pudo iniciar sesión.'
        );

        return;
      }


      // =========================
      // LOGIN CORRECTO
      // =========================

      window.location.href = '/';

    } catch (error) {

      console.error(error);

      setError(
        'No fue posible conectarse con el servidor.'
      );

    } finally {

      setLoading(false);
    }

  };


  // =========================
  // IR A VERIFICACIÓN
  // =========================

  const irAVerificarCorreo = () => {

    localStorage.setItem(
      'servix_verification_email',
      email.toLowerCase().trim()
    );

    window.location.href = '/verificar-correo';
  };


  return (

    <form
      className="login-form"
      onSubmit={iniciarSesion}
    >

      {/* EMAIL */}

      <div className="form-group">

        <label htmlFor="email">
          Correo electrónico
        </label>

        <input
          id="email"
          type="email"
          placeholder="correo@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

      </div>


      {/* PASSWORD */}

      <div className="form-group">

        <div className="password-label">

          <label htmlFor="password">
            Contraseña
          </label>

          <a href="/recuperar-password">
            ¿Olvidaste tu contraseña?
          </a>

        </div>

        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

      </div>


      {/* ERROR */}

      {error && (

        <div className="login-error">
          {error}
        </div>

      )}


      {/* VERIFICAR CORREO */}

      {correoNoVerificado && (

        <button
          type="button"
          className="verify-email-button"
          onClick={irAVerificarCorreo}
        >
          Verificar correo
        </button>

      )}


      {/* BOTÓN */}

      <button
        type="submit"
        className="login-button"
        disabled={loading}
      >

        {loading
          ? 'Iniciando sesión...'
          : 'Iniciar sesión →'
        }

      </button>


      {/* REGISTRO */}

      <div className="login-register">

        <span>
          ¿Todavía no tienes una cuenta?
        </span>

        <a href="/registro">
          Crear cuenta
        </a>

      </div>

    </form>

  );

}

