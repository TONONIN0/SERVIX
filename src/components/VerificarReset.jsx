import { useEffect, useState } from 'react';

export default function VerificarReset() {

  const [email, setEmail] = useState('');

  const [codigo, setCodigo] = useState('');

  const [nuevaPassword, setNuevaPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');


  useEffect(() => {

    const emailGuardado =
      localStorage.getItem(
        'servix_reset_email'
      );

    if (!emailGuardado) {

      window.location.href =
        '/recuperar-password';

      return;

    }

    setEmail(emailGuardado);

  }, []);


  const cambiarPassword = async (e) => {

    e.preventDefault();

    setError('');
    setSuccess('');


    // =========================
    // VALIDAR CÓDIGO
    // =========================

    if (codigo.length !== 6) {

      setError(
        'El código debe tener 6 dígitos.'
      );

      return;

    }


    // =========================
    // VALIDAR PASSWORD
    // =========================

    if (nuevaPassword.length < 6) {

      setError(
        'La contraseña debe tener al menos 6 caracteres.'
      );

      return;

    }


    // =========================
    // CONFIRMAR PASSWORD
    // =========================

    if (
      nuevaPassword !== confirmPassword
    ) {

      setError(
        'Las contraseñas no coinciden.'
      );

      return;

    }


    setLoading(true);


    try {

      const response = await fetch(
        '/api/reset-password',
        {

          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({

            email,

            codigo,

            nuevaPassword,

          }),

        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        setError(
          data.error ||
          'No fue posible cambiar la contraseña.'
        );

        return;

      }


      // =========================
      // ÉXITO
      // =========================

      setSuccess(
        'Contraseña actualizada correctamente.'
      );


      localStorage.removeItem(
        'servix_reset_email'
      );


      setTimeout(() => {

        window.location.href =
          '/login';

      }, 1500);


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
      onSubmit={cambiarPassword}
    >

      {/* CORREO */}

      <div className="form-group">

        <label>
          Correo electrónico
        </label>

        <input
          type="email"
          value={email}
          disabled
        />

      </div>


      {/* CÓDIGO */}

      <div className="form-group">

        <label htmlFor="codigo">
          Código de verificación
        </label>

        <input
          id="codigo"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          value={codigo}
          onChange={(e) =>
            setCodigo(
              e.target.value
                .replace(/\D/g, '')
            )
          }
          required
        />

      </div>


      {/* NUEVA PASSWORD */}

      <div className="form-group">

        <label htmlFor="nuevaPassword">
          Nueva contraseña
        </label>

        <input
          id="nuevaPassword"
          type="password"
          placeholder="••••••••"
          value={nuevaPassword}
          onChange={(e) =>
            setNuevaPassword(
              e.target.value
            )
          }
          required
        />

      </div>


      {/* CONFIRMAR PASSWORD */}

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
            setConfirmPassword(
              e.target.value
            )
          }
          required
        />

      </div>


      {/* ERROR */}

      {error && (

        <div className="login-error">
          {error}
        </div>

      )}


      {/* ÉXITO */}

      {success && (

        <div className="login-success">
          {success}
        </div>

      )}


      {/* BOTÓN */}

      <button
        type="submit"
        className="login-button"
        disabled={loading}
      >

        {loading
          ? 'Actualizando...'
          : 'Cambiar contraseña →'
        }

      </button>


      {/* VOLVER */}

      <div className="login-register">

        <a href="/login">
          ← Volver a iniciar sesión
        </a>

      </div>

    </form>

  );

}

