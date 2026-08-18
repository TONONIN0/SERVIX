
import { useState } from 'react';

export default function RecuperarPassword() {

  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');

  const solicitarCodigo = async (e) => {

    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {

      const response = await fetch(
        '/api/forgot-password',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setError(
          data.error ||
          'No fue posible enviar el código.'
        );

        return;
      }

      // Guardamos el correo para la siguiente pantalla

      localStorage.setItem(
        'servix_reset_email',
        email
      );

      // Mandamos al usuario a introducir el código

      window.location.href =
        '/verificar-reset';

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
      onSubmit={solicitarCodigo}
    >

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


      {error && (

        <div className="login-error">
          {error}
        </div>

      )}


      {success && (

        <div className="login-success">
          {success}
        </div>

      )}


      <button
        type="submit"
        className="login-button"
        disabled={loading}
      >

        {loading
          ? 'Enviando código...'
          : 'Enviar código →'
        }

      </button>


      <div className="login-register">

        <a href="/login">
          ← Volver a iniciar sesión
        </a>

      </div>

    </form>

  );

}

