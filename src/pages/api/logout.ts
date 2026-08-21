import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import prisma from '../../lib/prisma';

export const prerender = false;

export const POST: APIRoute = async ({
  cookies,
  request,
}) => {

  try {

    // =========================
    // OBTENER TOKEN
    // =========================

    const session =
      cookies.get('servix_session');


    // =========================
    // ELIMINAR SESIÓN
    // =========================

    if (session?.value) {

      const tokenHash =
        createHash('sha256')
          .update(session.value)
          .digest('hex');

      await prisma.session.deleteMany({
        where: {
          tokenHash,
        },
      });

    }


    // =========================
    // ELIMINAR COOKIE
    // =========================

    cookies.delete(
      'servix_session',
      {
        path: '/',
      }
    );


    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sesión cerrada correctamente',
      }),
      {
        status: 200,
        headers: {
          'Content-Type':
            'application/json',
        },
      }
    );

  } catch (error) {

    console.error(
      '🔥 ERROR LOGOUT:',
      error
    );

    cookies.delete(
      'servix_session',
      {
        path: '/',
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sesión cerrada',
      }),
      {
        status: 200,
        headers: {
          'Content-Type':
            'application/json',
        },
      }
    );

  }

};