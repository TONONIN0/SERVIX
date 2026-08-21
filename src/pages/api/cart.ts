import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma';
import { obtenerSesion } from '../../lib/auth';

export const prerender = false;


// =====================================================
// GET — OBTENER CARRITO
// =====================================================

export const GET: APIRoute = async ({
  cookies,
}) => {

  try {

    console.log(
      '🛒 Consultando carrito...'
    );


    // =================================================
    // AUTENTICAR SESIÓN
    // =================================================

    const sesion =
      await obtenerSesion(cookies);


    if (!sesion) {

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


    const userId =
      sesion.userId;


    // =================================================
    // BUSCAR CARRITO
    // =================================================

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


    // =================================================
    // CREAR CARRITO SI NO EXISTE
    // =================================================

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


    // =================================================
    // CALCULAR TOTAL
    // =================================================

    const total =
      carrito.items.reduce(
        (acumulado, item) => {

          return (
            acumulado +
            Number(
              item.product.precio
            ) *
            item.cantidad
          );

        },
        0
      );


    console.log(
      '✅ Carrito encontrado:',
      carrito.id
    );


    // =================================================
    // RESPUESTA
    // =================================================

    return new Response(

      JSON.stringify({

        success: true,

        cart: {

          id:
            carrito.id,

          items:
            carrito.items,

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
    // AUTENTICAR SESIÓN
    // =================================================

    const sesion =
      await obtenerSesion(cookies);


    if (!sesion) {

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


    const userId =
      sesion.userId;


    // =================================================
    // BODY
    // =================================================

    const body =
      await request.json();


    const productId =
      Number(body.productId);


    const cantidad =
      Number(
        body.cantidad ?? 1
      );


    // =================================================
    // VALIDAR PRODUCTO
    // =================================================

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
    // VALIDAR CANTIDAD
    // =================================================

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

          id:
            productId,

          activo:
            true,

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
    // BUSCAR CARRITO
    // =================================================

    let carrito =
      await prisma.cart.findUnique({

        where: {

          userId,

        },

      });


    // =================================================
    // CREAR CARRITO SI NO EXISTE
    // =================================================

    if (!carrito) {

      carrito =
        await prisma.cart.create({

          data: {

            userId,

          },

        });

    }


    // =================================================
    // BUSCAR ITEM EXISTENTE
    // =================================================

    const itemExistente =
      await prisma.cartItem.findUnique({

        where: {

          cartId_productId: {

            cartId:
              carrito.id,

            productId:
              producto.id,

          },

        },

      });


    const cantidadFinal =
      itemExistente
        ? itemExistente.cantidad +
          cantidad
        : cantidad;


    // =================================================
    // VALIDAR STOCK
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
    // ACTUALIZAR ITEM EXISTENTE
    // =================================================

    if (itemExistente) {

      const itemActualizado =
        await prisma.cartItem.update({

          where: {

            id:
              itemExistente.id,

          },

          data: {

            cantidad:
              cantidadFinal,

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

    }


    // =================================================
    // CREAR NUEVO ITEM
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

        item:
          nuevoItem,

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
    // AUTENTICAR SESIÓN
    // =================================================

    const sesion =
      await obtenerSesion(cookies);


    if (!sesion) {

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


    const userId =
      sesion.userId;


    // =================================================
    // BODY
    // =================================================

    const body =
      await request.json();


    const productId =
      Number(body.productId);


    const cantidad =
      Number(body.cantidad);


    // =================================================
    // VALIDAR PRODUCTO
    // =================================================

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
    // VALIDAR CANTIDAD
    // =================================================

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

          id:
            productId,

          activo:
            true,

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
    // VALIDAR STOCK
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

          id:
            item.id,

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
    // AUTENTICAR SESIÓN
    // =================================================

    const sesion =
      await obtenerSesion(cookies);


    if (!sesion) {

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


    const userId =
      sesion.userId;


    // =================================================
    // BODY
    // =================================================

    const body =
      await request.json();


    const productId =
      Number(body.productId);


    // =================================================
    // VALIDAR PRODUCTO
    // =================================================

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
    // ELIMINAR ITEM
    // =================================================

    await prisma.cartItem.delete({

      where: {

        id:
          item.id,

      },

    });


    console.log(
      '✅ Producto eliminado'
    );


    // =================================================
    // RESPUESTA
    // =================================================

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