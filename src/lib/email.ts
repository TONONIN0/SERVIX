import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export async function enviarCodigoVerificacion(
  email: string,
  nombre: string,
  codigo: string
) {
  const { data, error } = await resend.emails.send({
    from: 'SERVIX <onboarding@resend.dev>',
    to: [email],
    subject: 'Código de verificación - SERVIX',
    html: `
      <div style="
        font-family: Arial, Helvetica, sans-serif;
        background-color: #07111f;
        padding: 40px;
        color: #f5f7fa;
      ">

        <div style="
          max-width: 550px;
          margin: auto;
          background-color: #0a1625;
          padding: 40px;
          border-radius: 18px;
        ">

          <h1 style="
            margin: 0 0 20px;
            font-size: 32px;
          ">
            SERVI<span style="color:#6FBE44;">X</span>
          </h1>

          <h2>
            Verifica tu correo
          </h2>

          <p style="color:#c8d0dc;">
            Hola ${nombre},
          </p>

          <p style="color:#c8d0dc;">
            Utiliza el siguiente código para verificar tu cuenta:
          </p>

          <div style="
            margin: 30px 0;
            padding: 20px;
            text-align: center;
            background-color: #07111f;
            border: 1px solid rgba(111,190,68,0.3);
            border-radius: 12px;
          ">

            <span style="
              font-size: 36px;
              font-weight: 700;
              letter-spacing: 10px;
              color: #6FBE44;
            ">
              ${codigo}
            </span>

          </div>

          <p style="
            color:#8f9baa;
            font-size:14px;
          ">
            Este código expirará en 10 minutos.
          </p>

          <p style="
            color:#8f9baa;
            font-size:14px;
          ">
            Si tú no creaste esta cuenta, puedes ignorar este correo.
          </p>

        </div>

      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}