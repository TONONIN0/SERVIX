
import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const prerender = false;

export const GET: APIRoute = async ({
  params,
  cookies,
}) => {

  try {

    console.log('🔎 Consultando detalle del pedido...');


    // =========================
    // VERIFICAR SESIÓN
    // =========================

    const session =
      cookies.get('servix_session');


    if (!session) {

      return new Response(
        JSON.stringify({
          error: 'No has iniciado sesión',
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


    const userId =
      Number(session.value);


    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {

      return new Response(
        JSON.stringify({
          error: 'Sesión inválida',
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
          error: 'ID de pedido inválido',
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

          id: orderId,

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

        order: pedido,

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

