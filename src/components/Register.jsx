import { useState } from 'react';

export default function Register() {

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const registrarUsuario = async (e) => {

    e.preventDefault();

    setError('');

    // =========================
    // VALIDAR CONTRASEÑAS
    // =========================

    if (password !== confirmPassword) {

      setError(
        'Las contraseñas no coinciden.'
      );

      return;
    }

    // =========================
    // VALIDAR PASSWORD
    // =========================

    if (password.length < 6) {

      setError(
        'La contraseña debe tener al menos 6 caracteres.'
      );

      return;
    }

    setLoading(true);

    try {

      const response = await fetch('/api/register', {

        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          nombre,
          email,
          password,
        }),

      });

      const data = await response.json();

      if (!response.ok) {

        setError(
          data.error ||
          'No fue posible crear la cuenta.'
        );

        return;
      }

      // =========================
      // REGISTRO CORRECTO
      // =========================

        localStorage.setItem(
        'servix_verification_email',
        email.toLowerCase().trim()
      );

      window.location.href = '/verificar-correo';

    } catch (error) {

      console.error(error);

      setError(
        'No fue posible conectarse con el servidor.'
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <form
      className="login-form"
      onSubmit={registrarUsuario}
    >

      {/* =========================
          NOMBRE
      ========================= */}

      <div className="form-group">

        <label htmlFor="nombre">
          Nombre
        </label>

        <input
          id="nombre"
          type="text"
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) =>
            setNombre(e.target.value)
          }
          required
        />

      </div>


      {/* =========================
          EMAIL
      ========================= */}

      <div className="form-group">

        <label htmlFor="email">
          Correo electrónico
        </label>

        <input
          id="email"
          type="email"
          placeholder="correo@empresa.com"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          required
        />

      </div>


      {/* =========================
          PASSWORD
      ========================= */}

      <div className="form-group">

        <label htmlFor="password">
          Contraseña
        </label>

        <input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

      </div>


      {/* =========================
          CONFIRMAR PASSWORD
      ========================= */}

      <div className="form-group">

        <label htmlFor="confirmPassword">
          Confirmar contraseña
        </label>

        <input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
          required
        />

      </div>


      {/* =========================
          ERROR
      ========================= */}

      {error && (

        <div className="login-error">
          {error}
        </div>

      )}


      {/* =========================
          BOTÓN
      ========================= */}

      <button
        type="submit"
        className="login-button"
        disabled={loading}
      >

        {loading
          ? 'Creando cuenta...'
          : 'Crear cuenta →'
        }

      </button>


      {/* =========================
          LOGIN
      ========================= */}

      <div className="login-register">

        <span>
          ¿Ya tienes una cuenta?
        </span>

        <a href="/login">
          Iniciar sesión
        </a>

      </div>

    </form>

  );

}