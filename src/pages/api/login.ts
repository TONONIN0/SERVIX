import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import prisma from '../../lib/prisma';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    console.log('📥 Login recibido');

    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          error: 'Correo y contraseña son obligatorios',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('🔎 Buscando usuario...');

    const usuario = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!usuario) {
      return new Response(
        JSON.stringify({
          error: 'Correo o contraseña incorrectos',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('🔐 Verificando contraseña...');

    const passwordCorrecta = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordCorrecta) {
      return new Response(
        JSON.stringify({
          error: 'Correo o contraseña incorrectos',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('✅ Login correcto');

    cookies.set('servix_session', String(usuario.id), {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Inicio de sesión correcto',
        user: {
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('🔥 ERROR LOGIN:', error);

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