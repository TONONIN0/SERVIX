import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import prisma from '../../../lib/prisma';

export const prerender = false;


// =====================================================
// AUTENTICAR SESIÓN
// =====================================================

async function obtenerUsuarioDesdeSesion(
  cookies: Parameters<APIRoute>[0]['cookies']
) {

  const session =
    cookies.get('servix_session');


  if (!session?.value) {
    return null;
  }


  // =========================
  // HASH DEL TOKEN
  // =========================

  const tokenHash =
    createHash('sha256')
      .update(session.value)
      .digest('hex');


  // =========================
  // BUSCAR SESIÓN
  // =========================

  const sesion =
    await prisma.session.findUnique({

      where: {
        tokenHash,
      },

      select: {

        userId: true,

        expiresAt: true,

      },

    });


  if (!sesion) {

    cookies.delete(
      'servix_session',
      {
        path: '/',
      }
    );

    return null;

  }


  // =========================
  // VERIFICAR EXPIRACIÓN
  // =========================

  if (
    sesion.expiresAt <=
    new Date()
  ) {

    await prisma.session.delete({

      where: {
        tokenHash,
      },

    });

    cookies.delete(
      'servix_session',
      {
        path: '/',
      }
    );

    return null;

  }


  return sesion.userId;

}


// =====================================================
// GET — DETALLE DEL PEDIDO
// =====================================================

export const GET: APIRoute = async ({
  params,
  cookies,
}) => {

  try {

    console.log(
      '🔎 Consultando detalle del pedido...'
    );


    // =========================
    // VERIFICAR SESIÓN
    // =========================

    const userId =
      await obtenerUsuarioDesdeSesion(
        cookies
      );


    if (!userId) {

      return new Response(

        JSON.stringify({

          error:
            'No has iniciado sesión',

        }),

        {

          status: 401,

          headers: {

            'Content-Type':
              'application/json',

          },

        }

      );

    }


    // =========================
    // OBTENER ID
    // =========================

    const orderId =
      Number(params.id);


    if (
      !Number.isInteger(orderId) ||
      orderId <= 0
    ) {

      return new Response(

        JSON.stringify({

          error:
            'ID de pedido inválido',

        }),

        {

          status: 400,

          headers: {

            'Content-Type':
              'application/json',

          },

        }

      );

    }


    console.log(
      '📦 Pedido solicitado:',
      orderId
    );


    // =========================
    // BUSCAR PEDIDO
    // =========================

    const pedido =
      await prisma.order.findFirst({

        where: {

          id:
            orderId,

          userId,

        },

        include: {

          items: {

            include: {

              product: true,

            },

          },

        },

      });


    // =========================
    // PEDIDO NO ENCONTRADO
    // =========================

    if (!pedido) {

      return new Response(

        JSON.stringify({

          error:
            'No existe este pedido',

        }),

        {

          status: 404,

          headers: {

            'Content-Type':
              'application/json',

          },

        }

      );

    }


    console.log(
      '✅ Pedido encontrado:',
      pedido.id
    );


    // =========================
    // RESPUESTA
    // =========================

    return new Response(

      JSON.stringify({

        success: true,

        order:
          pedido,

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
      '🔥 ERROR DETALLE PEDIDO:',
      error
    );


    return new Response(

      JSON.stringify({

        error:
          'No fue posible consultar el pedido',

      }),

      {

        status: 500,

        headers: {

          'Content-Type':
            'application/json',

        },

      }

    );

  }

};