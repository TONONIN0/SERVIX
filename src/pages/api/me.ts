import type { APIRoute } from 'astro';
import { obtenerSesion } from '../../lib/auth';

export const prerender = false;


// =====================================================
// GET — OBTENER USUARIO ACTUAL
// =====================================================

export const GET: APIRoute = async ({
  cookies,
}) => {

  try {

    console.log(
      '👤 Consultando sesión actual...'
    );


    // =================================================
    // AUTENTICAR SESIÓN
    // =================================================

    const sesion =
      await obtenerSesion(cookies);


    // =================================================
    // NO AUTENTICADO
    // =================================================

    if (!sesion) {

      return new Response(

        JSON.stringify({

          authenticated:
            false,

        }),

        {

          status:
            401,

          headers: {

            'Content-Type':
              'application/json',

          },

        }

      );

    }


    // =================================================
    // SESIÓN VÁLIDA
    // =================================================

    console.log(
      '✅ Usuario autenticado:',
      sesion.user.id
    );


    return new Response(

      JSON.stringify({

        authenticated:
          true,

        user:
          sesion.user,

      }),

      {

        status:
          200,

        headers: {

          'Content-Type':
            'application/json',

          'Cache-Control':
            'no-store',

        },

      }

    );


  } catch (error) {

    console.error(
      '🔥 ERROR ME:',
      error
    );


    return new Response(

      JSON.stringify({

        authenticated:
          false,

        error:
          'Error interno del servidor',

      }),

      {

        status:
          500,

        headers: {

          'Content-Type':
            'application/json',

        },

      }

    );

  }

};

