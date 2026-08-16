import { useState } from 'react';

export default function Register() {

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
  setSuccess('');

  if (form.password !== form.confirmarPassword) {
    setError('Las contraseñas no coinciden');
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
        nombre: form.nombre,
        email: form.email,
        password: form.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'No se pudo crear la cuenta');
      return;
    }

    setSuccess('¡Cuenta creada correctamente!');

  } catch (error) {
    console.error(error);
    setError('No se pudo conectar con el servidor');

  } finally {
    setLoading(false);
  }
};


  return (

    <form
      className="register-form"
      onSubmit={handleSubmit}
    >

      <div className="form-group">

        <label htmlFor="nombre">
          Nombre
        </label>

        <input
          id="nombre"
          name="nombre"
          type="text"
          placeholder="Tu nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />

      </div>


      <div className="form-group">

        <label htmlFor="email">
          Correo electrónico
        </label>

        <input
          id="email"
          name="email"
          type="email"
          placeholder="correo@empresa.com"
          value={form.email}
          onChange={handleChange}
          required
        />

      </div>


      <div className="form-group">

        <label htmlFor="password">
          Contraseña
        </label>

        <input
          id="password"
          name="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={form.password}
          onChange={handleChange}
          minLength={6}
          required
        />

      </div>


      <div className="form-group">

        <label htmlFor="confirmarPassword">
          Confirmar contraseña
        </label>

        <input
          id="confirmarPassword"
          name="confirmarPassword"
          type="password"
          placeholder="Repite tu contraseña"
          value={form.confirmarPassword}
          onChange={handleChange}
          required
        />

      </div>


      {error && (
        <p className="form-error">
          {error}
        </p>
      )}


      {success && (
        <p className="form-success">
          {success}
        </p>
      )}


      <button
        type="submit"
        disabled={loading}
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>


      <p className="login-link">

        ¿Ya tienes una cuenta?

        <a href="/login">
          Inicia sesión
        </a>

      </p>

    </form>

  );

}