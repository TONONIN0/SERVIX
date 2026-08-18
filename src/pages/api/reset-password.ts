import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('🔐 Solicitud para cambiar contraseña');

    const body = await request.json();

    const { email, codigo, nuevaPassword } = body;

    // =========================
    // VALIDAR CAMPOS
    // =========================

    if (!email || !codigo || !nuevaPassword) {
      return new Response(
        JSON.stringify({
          error: 'Todos los campos son obligatorios',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // =========================
    // VALIDAR PASSWORD
    // =========================

    if (nuevaPassword.length < 6) {
      return new Response(
        JSON.stringify({
          error:
            'La contraseña debe tener al menos 6 caracteres',
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
          error: 'Código inválido o expirado',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // =========================
    // COMPROBAR CÓDIGO
    // =========================

    if (
      !usuario.passwordResetCode ||
      !usuario.passwordResetCodeExpires
    ) {
      return new Response(
        JSON.stringify({
          error: 'No existe un código de recuperación',
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
      usuario.passwordResetCode !== codigo
    ) {
      return new Response(
        JSON.stringify({
          error: 'Código incorrecto',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // =========================
    // COMPROBAR EXPIRACIÓN
    // =========================

    if (
      new Date() >
      usuario.passwordResetCodeExpires
    ) {
      return new Response(
        JSON.stringify({
          error: 'El código ha expirado',
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

    // =========================
    // GENERAR NUEVO HASH
    // =========================

    console.log('🔐 Generando nueva contraseña...');

    const passwordHash = await bcrypt.hash(
      nuevaPassword,
      10
    );

    // =========================
    // ACTUALIZAR USUARIO
    // =========================

    console.log('💾 Actualizando contraseña...');

    await prisma.user.update({
      where: {
        id: usuario.id,
      },

      data: {
        password: passwordHash,

        // Invalidamos el código inmediatamente
        passwordResetCode: null,
        passwordResetCodeExpires: null,
      },
    });

    console.log('🎉 Contraseña actualizada');

    return new Response(
      JSON.stringify({
        success: true,
        message:
          'Contraseña actualizada correctamente',
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
      '🔥 ERROR RESET PASSWORD:',
      error
    );

    return new Response(
      JSON.stringify({
        error:
          'Error interno del servidor',
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

