import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📧 Verificación de correo recibida');

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

    const { email, codigo } = body;

    if (!email || !codigo) {
      return new Response(
        JSON.stringify({
          error: 'El correo y el código son obligatorios',
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

    if (!usuario.verificationCode) {
      return new Response(
        JSON.stringify({
          error: 'No existe un código de verificación',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (
      !usuario.verificationCodeExpires ||
      usuario.verificationCodeExpires < new Date()
    ) {
      return new Response(
        JSON.stringify({
          error: 'El código de verificación ha expirado',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (usuario.verificationCode !== String(codigo)) {
      return new Response(
        JSON.stringify({
          error: 'El código de verificación es incorrecto',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('✅ Código correcto');

    await prisma.user.update({
      where: {
        id: usuario.id,
      },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      },
    });

    console.log('🎉 Correo verificado correctamente');

    return new Response(
      JSON.stringify({
        message: 'Correo verificado correctamente',
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