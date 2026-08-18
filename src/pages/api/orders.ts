
import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma';

export const prerender = false;


// =====================================================
// GET — CONSULTAR MIS PEDIDOS
// =====================================================

export const GET: APIRoute = async ({
  cookies,
}) => {

  try {

    console.log('📋 Consultando pedidos...');


    // =========================
    // SESIÓN
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
    // BUSCAR PEDIDOS
    // =========================

    const pedidos =
      await prisma.order.findMany({

        where: {
          userId,
        },

        orderBy: {
          createdAt: 'desc',
        },

        include: {

          items: {

            include: {
              product: true,
            },

          },

        },

      });


    console.log(
      '✅ Pedidos encontrados:',
      pedidos.length
    );


    return new Response(

      JSON.stringify({

        success: true,

        orders: pedidos,

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
      '🔥 ERROR CONSULTANDO PEDIDOS:',
      error
    );


    return new Response(

      JSON.stringify({

        error:
          'No fue posible consultar tus pedidos',

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


// =====================================================
// POST — CREAR PEDIDO
// =====================================================

export const POST: APIRoute = async ({
  request,
  cookies,
}) => {

  try {

    console.log('📦 Creando pedido...');


    // =========================
    // SESIÓN
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
    // BODY
    // =========================

    const body =
      await request.json();


    const {
      direccion,
      ciudad,
      telefono,
      notas,
    } = body;


    if (
      !direccion ||
      !ciudad ||
      !telefono
    ) {

      return new Response(
        JSON.stringify({
          error:
            'Dirección, ciudad y teléfono son obligatorios',
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


    // =========================
    // CARRITO
    // =========================

    const carrito =
      await prisma.cart.findUnique({

        where: {
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


    if (!carrito) {

      return new Response(
        JSON.stringify({
          error:
            'No existe un carrito',
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


    if (
      carrito.items.length === 0
    ) {

      return new Response(
        JSON.stringify({
          error:
            'Tu carrito está vacío',
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


    // =========================
    // VALIDAR STOCK
    // =========================

    for (
      const item of carrito.items
    ) {

      if (!item.product.activo) {

        return new Response(
          JSON.stringify({
            error:
              `El producto "${item.product.nombre}" ya no está disponible`,
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


      if (
        item.cantidad >
        item.product.stock
      ) {

        return new Response(
          JSON.stringify({
            error:
              `No hay suficiente stock de "${item.product.nombre}"`,
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

    }


    // =========================
    // CALCULAR TOTAL
    // =========================

    let total = 0;


    for (
      const item of carrito.items
    ) {

      total +=
        Number(item.product.precio) *
        item.cantidad;

    }


    // =========================
    // CREAR PEDIDO
    // =========================

    const pedido =
      await prisma.$transaction(
        async (tx) => {

          const nuevoPedido =
            await tx.order.create({

              data: {

                userId,

                estado:
                  'pendiente',

                total,

                items: {

                  create:
                    carrito.items.map(
                      (item) => ({

                        productId:
                          item.productId,

                        cantidad:
                          item.cantidad,

                        precio:
                          item.product.precio,

                      })
                    ),

                },

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
          // DESCONTAR STOCK
          // =========================

          for (
            const item of carrito.items
          ) {

            await tx.product.update({

              where: {
                id: item.productId,
              },

              data: {

                stock: {
                  decrement:
                    item.cantidad,
                },

              },

            });

          }


          // =========================
          // VACIAR CARRITO
          // =========================

          await tx.cartItem.deleteMany({

            where: {
              cartId:
                carrito.id,
            },

          });


          return nuevoPedido;

        }
      );


    console.log(
      '✅ Pedido creado:',
      pedido.id
    );


    // =========================
    // RESPUESTA
    // =========================

    return new Response(

      JSON.stringify({

        success: true,

        message:
          'Pedido creado correctamente',

        order: {

          id:
            pedido.id,

          estado:
            pedido.estado,

          total:
            pedido.total,

        },

      }),

      {

        status: 201,

        headers: {

          'Content-Type':
            'application/json',

        },

      }

    );


  } catch (error) {

    console.error(
      '🔥 ERROR CREANDO PEDIDO:',
      error
    );


    return new Response(

      JSON.stringify({

        error:
          'No fue posible crear el pedido',

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

