import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma';

export const prerender = false;


// =====================================================
// GET — OBTENER CARRITO
// =====================================================

export const GET: APIRoute = async ({
  cookies,
}) => {

  try {

    console.log('🛒 Consultando carrito...');

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


    let carrito =
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

      carrito =
        await prisma.cart.create({

          data: {
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

    }


    const total =
      carrito.items.reduce(
        (acumulado, item) => {

          return (
            acumulado +
            Number(item.product.precio) *
            item.cantidad
          );

        },
        0
      );


    console.log(
      '✅ Carrito encontrado:',
      carrito.id
    );


    return new Response(

      JSON.stringify({

        success: true,

        cart: {

          id: carrito.id,

          items: carrito.items,

          total,

        },

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
      '🔥 ERROR DEL CARRITO:',
      error
    );


    return new Response(

      JSON.stringify({

        error:
          'No fue posible obtener el carrito',

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
// POST — AGREGAR PRODUCTO
// =====================================================

export const POST: APIRoute = async ({
  request,
  cookies,
}) => {

  try {

    console.log(
      '🛒 Agregando producto al carrito...'
    );

    


    // =================================================
    // SESIÓN
    // =================================================

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


    // =================================================
    // BODY
    // =================================================

    const body =
      await request.json();


    const productId =
      Number(body.productId);


    const cantidad =
      Number(body.cantidad ?? 1);


    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {

      return new Response(
        JSON.stringify({
          error: 'Producto inválido',
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
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {

      return new Response(
        JSON.stringify({
          error:
            'La cantidad debe ser mayor a 0',
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


    // =================================================
    // BUSCAR PRODUCTO
    // =================================================

    console.log(
      '🔎 Buscando producto:',
      productId
    );


    const producto =
      await prisma.product.findFirst({

        where: {
          id: productId,
          activo: true,
        },

      });


    if (!producto) {

      return new Response(
        JSON.stringify({
          error:
            'El producto no existe',
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


    // =================================================
    // BUSCAR / CREAR CARRITO
    // =================================================

    let carrito =
      await prisma.cart.findUnique({

        where: {
          userId,
        },

      });


    if (!carrito) {

      carrito =
        await prisma.cart.create({

          data: {
            userId,
          },

        });

    }


    // =================================================
    // BUSCAR PRODUCTO EN CARRITO
    // =================================================

    const itemExistente =
      await prisma.cartItem.findUnique({

        where: {

          cartId_productId: {

            cartId: carrito.id,

            productId: producto.id,

          },

        },

      });


    const cantidadFinal =
      itemExistente
        ? itemExistente.cantidad + cantidad
        : cantidad;


    // =================================================
    // COMPROBAR STOCK
    // =================================================

    if (
      cantidadFinal >
      producto.stock
    ) {

      return new Response(
        JSON.stringify({
          error:
            `Solo hay ${producto.stock} unidades disponibles`,
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


    // =================================================
    // ACTUALIZAR
    // =================================================

    if (itemExistente) {

      const itemActualizado =
        await prisma.cartItem.update({

          where: {
            id: itemExistente.id,
          },

          data: {
            cantidad: cantidadFinal,
          },

        });


      console.log(
        '✅ Cantidad actualizada'
      );


      return new Response(

        JSON.stringify({

          success: true,

          message:
            'Producto agregado al carrito',

          item: itemActualizado,

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


    // =================================================
    // CREAR ITEM
    // =================================================

    const nuevoItem =
      await prisma.cartItem.create({

        data: {

          cartId:
            carrito.id,

          productId:
            producto.id,

          cantidad,

        },

      });


    console.log(
      '✅ Producto agregado al carrito'
    );


    return new Response(

      JSON.stringify({

        success: true,

        message:
          'Producto agregado al carrito',

        item: nuevoItem,

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
      '🔥 ERROR AGREGANDO AL CARRITO:',
      error
    );


    return new Response(

      JSON.stringify({

        error:
          'No fue posible agregar el producto',

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
// PUT — ACTUALIZAR CANTIDAD
// =====================================================

export const PUT: APIRoute = async ({
  request,
  cookies,
}) => {

  try {

    console.log(
      '🔄 Actualizando cantidad del carrito...'
    );


    // =================================================
    // SESIÓN
    // =================================================

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


    // =================================================
    // BODY
    // =================================================

    const body =
      await request.json();


    const productId =
      Number(body.productId);


    const cantidad =
      Number(body.cantidad);


    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {

      return new Response(
        JSON.stringify({
          error: 'Producto inválido',
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
      !Number.isInteger(cantidad) ||
      cantidad < 1
    ) {

      return new Response(
        JSON.stringify({
          error:
            'La cantidad debe ser mayor a 0',
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


    // =================================================
    // BUSCAR PRODUCTO
    // =================================================

    const producto =
      await prisma.product.findFirst({

        where: {
          id: productId,
          activo: true,
        },

      });


    if (!producto) {

      return new Response(
        JSON.stringify({
          error:
            'El producto no existe',
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


    // =================================================
    // COMPROBAR STOCK
    // =================================================

    if (
      cantidad >
      producto.stock
    ) {

      return new Response(
        JSON.stringify({
          error:
            `Solo hay ${producto.stock} unidades disponibles`,
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


    // =================================================
    // BUSCAR CARRITO
    // =================================================

    const carrito =
      await prisma.cart.findUnique({

        where: {
          userId,
        },

      });


    if (!carrito) {

      return new Response(
        JSON.stringify({
          error:
            'El carrito no existe',
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


    // =================================================
    // BUSCAR ITEM
    // =================================================

    const item =
      await prisma.cartItem.findUnique({

        where: {

          cartId_productId: {

            cartId:
              carrito.id,

            productId,

          },

        },

      });


    if (!item) {

      return new Response(
        JSON.stringify({
          error:
            'El producto no está en el carrito',
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


    // =================================================
    // ACTUALIZAR
    // =================================================

    const itemActualizado =
      await prisma.cartItem.update({

        where: {
          id: item.id,
        },

        data: {
          cantidad,
        },

      });


    console.log(
      '✅ Cantidad actualizada:',
      cantidad
    );


    return new Response(

      JSON.stringify({

        success: true,

        message:
          'Cantidad actualizada',

        item:
          itemActualizado,

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
      '🔥 ERROR ACTUALIZANDO CARRITO:',
      error
    );


    return new Response(

      JSON.stringify({

        error:
          'No fue posible actualizar la cantidad',

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
// DELETE — ELIMINAR PRODUCTO
// =====================================================

export const DELETE: APIRoute = async ({
  request,
  cookies,
}) => {

  try {

    console.log(
      '🗑️ Eliminando producto del carrito...'
    );


    // =================================================
    // SESIÓN
    // =================================================

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


    // =================================================
    // BODY
    // =================================================

    const body =
      await request.json();


    const productId =
      Number(body.productId);


    if (
      !Number.isInteger(productId) ||
      productId <= 0
    ) {

      return new Response(
        JSON.stringify({
          error:
            'Producto inválido',
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


    // =================================================
    // BUSCAR CARRITO
    // =================================================

    const carrito =
      await prisma.cart.findUnique({

        where: {
          userId,
        },

      });


    if (!carrito) {

      return new Response(
        JSON.stringify({
          error:
            'El carrito no existe',
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


    // =================================================
    // BUSCAR ITEM
    // =================================================

    const item =
      await prisma.cartItem.findUnique({

        where: {

          cartId_productId: {

            cartId:
              carrito.id,

            productId,

          },

        },

      });


    if (!item) {

      return new Response(
        JSON.stringify({
          error:
            'El producto no está en el carrito',
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


    // =================================================
    // ELIMINAR
    // =================================================

    await prisma.cartItem.delete({

      where: {
        id: item.id,
      },

    });


    console.log(
      '✅ Producto eliminado'
    );


    return new Response(

      JSON.stringify({

        success: true,

        message:
          'Producto eliminado del carrito',

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
      '🔥 ERROR ELIMINANDO PRODUCTO:',
      error
    );


    return new Response(

      JSON.stringify({

        error:
          'No fue posible eliminar el producto',

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

