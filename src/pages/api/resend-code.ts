import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma';
import { enviarCodigoVerificacion } from '../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📧 Solicitud de nuevo código recibida');

    const text = await request.text();

    if (!text) {
      return new Response(
        JSON.stringify({
          error: 'La petición llegó vacía',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const body = JSON.parse(text);

    const { email } = body;

    if (!email) {
      return new Response(
        JSON.stringify({
          error: 'El correo es obligatorio',
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

    if (!usuario) {
      return new Response(
        JSON.stringify({
          error: 'No existe una cuenta con este correo',
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (usuario.emailVerified) {
      return new Response(
        JSON.stringify({
          error: 'Este correo ya está verificado',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('🔢 Generando nuevo código...');

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const verificationCodeExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    console.log('💾 Guardando nuevo código...');

    await prisma.user.update({
      where: {
        id: usuario.id,
      },
      data: {
        verificationCode,
        verificationCodeExpires,
      },
    });

    console.log('📧 Enviando nuevo código...');

    await enviarCodigoVerificacion(
      usuario.email,
      usuario.nombre,
      verificationCode
    );

    console.log('✅ Nuevo código enviado');

    return new Response(
      JSON.stringify({
        message: 'Nuevo código enviado correctamente',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('🔥 ERROR COMPLETO:', error);

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