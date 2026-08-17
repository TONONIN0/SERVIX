import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma';

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const session = cookies.get('servix_session');

    if (!session) {
      return new Response(
        JSON.stringify({
          authenticated: false,
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const userId = Number(session.value);

    const usuario = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
      },
    });

    if (!usuario) {
      cookies.delete('servix_session', {
        path: '/',
      });

      return new Response(
        JSON.stringify({
          authenticated: false,
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        user: usuario,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('🔥 ERROR ME:', error);

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