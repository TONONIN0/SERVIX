import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';
import { enviarCodigoVerificacion } from '../../lib/email';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('📥 Registro recibido');

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

    const { nombre, email, password } = body;

    if (!nombre || !email || !password) {
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

    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          error: 'La contraseña debe tener al menos 6 caracteres',
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

    const usuarioExistente = await prisma.user.findUnique({
      where: {
        email: emailNormalizado,
      },
    });

    if (usuarioExistente) {
      return new Response(
        JSON.stringify({
          error: 'Este correo ya está registrado',
        }),
        {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('🔐 Creando hash...');

        const passwordHash = await bcrypt.hash(password, 10);

        console.log('🔢 Generando código de verificación...');

        const verificationCode = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        const verificationCodeExpires = new Date(
          Date.now() + 10 * 60 * 1000
        );

        console.log('💾 Creando usuario en MySQL...');

        const usuario = await prisma.user.create({
          data: {
            nombre: nombre.trim(),
            email: emailNormalizado,
            password: passwordHash,

            emailVerified: false,

            verificationCode,
            verificationCodeExpires,
          },
        });

      console.log('📧 Enviando código de verificación...');

      await enviarCodigoVerificacion(
        usuario.email,
        usuario.nombre,
        verificationCode
      );

      console.log('✅ Código enviado al correo');

    console.log('✅ Usuario creado:', usuario.id);

    return new Response(
      JSON.stringify({
        message: 'Cuenta creada correctamente',
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
        },
      }),
      {
        status: 201,
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
        details:
          error instanceof Error
            ? error.message
            : String(error),
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