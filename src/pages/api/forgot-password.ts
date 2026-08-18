import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma';
import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📧 Solicitud de recuperación de contraseña');

    const body = await request.json();

    const { email } = body;

    if (!email) {
      return new Response(
        JSON.stringify({
          error: 'El correo electrónico es obligatorio',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const emailNormalizado = email.toLowerCase().trim();

    console.log('🔎 Buscando usuario...');

    const usuario = await prisma.user.findUnique({
      where: {
        email: emailNormalizado,
      },
    });

    /*
     * Por seguridad NO decimos si el correo existe o no.
     */

    if (!usuario) {
      console.log('⚠️ Usuario no encontrado');

      return new Response(
        JSON.stringify({
          success: true,
          message:
            'Si el correo está registrado, recibirás un código de recuperación.',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // =========================
    // GENERAR CÓDIGO
    // =========================

    const codigo = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const expiracion = new Date(
      Date.now() + 10 * 60 * 1000
    );

    console.log('🔢 Código generado:', codigo);

    // =========================
    // GUARDAR CÓDIGO
    // =========================

    await prisma.user.update({
      where: {
        id: usuario.id,
      },
      data: {
        passwordResetCode: codigo,
        passwordResetCodeExpires: expiracion,
      },
    });

    console.log('💾 Código guardado');

    // =========================
    // ENVIAR CORREO
    // =========================

    console.log('📨 Enviando correo...');

    const { error } = await resend.emails.send({
      from: 'SERVIX <onboarding@resend.dev>',
      to: [usuario.email],
      subject: 'Código para recuperar tu contraseña - SERVIX',

      html: `
        <div style="
          font-family: Arial, sans-serif;
          background-color: #07111f;
          padding: 40px;
          color: #f5f7fa;
        ">

          <div style="
            max-width: 500px;
            margin: auto;
            background-color: #0d1a2b;
            padding: 40px;
            border-radius: 16px;
            text-align: center;
          ">

            <h1 style="
              margin-bottom: 10px;
              color: #f5f7fa;
            ">
              SERVI<span style="color:#6FBE44;">X</span>
            </h1>

            <h2 style="color:#f5f7fa;">
              Recupera tu contraseña
            </h2>

            <p style="color:#c8d0dc;">
              Recibimos una solicitud para cambiar
              tu contraseña.
            </p>

            <p style="color:#c8d0dc;">
              Utiliza este código:
            </p>

            <div style="
              margin: 30px 0;
              padding: 20px;
              background-color: #07111f;
              border-radius: 12px;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #6FBE44;
            ">
              ${codigo}
            </div>

            <p style="color:#c8d0dc;">
              Este código expirará en 10 minutos.
            </p>

            <p style="
              margin-top:30px;
              color:#6f7c8d;
              font-size:13px;
            ">
              Si tú no solicitaste este cambio,
              puedes ignorar este correo.
            </p>

          </div>

        </div>
      `,
    });

    if (error) {
      console.error('❌ Error Resend:', error);

      return new Response(
        JSON.stringify({
          error: 'No fue posible enviar el correo.',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('✅ Correo enviado');

    return new Response(
      JSON.stringify({
        success: true,
        message:
          'Si el correo está registrado, recibirás un código de recuperación.',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {

    console.error(
      '🔥 ERROR RECUPERACIÓN:',
      error
    );

    return new Response(
      JSON.stringify({
        error: 'Error interno del servidor',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

