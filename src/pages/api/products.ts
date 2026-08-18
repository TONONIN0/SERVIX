import type { APIRoute } from 'astro';
import prisma from '../../lib/prisma';

export const prerender = false;


// =========================
// GET — OBTENER PRODUCTOS
// =========================

export const GET: APIRoute = async () => {

  try {

    const productos = await prisma.product.findMany({
      where: {
        activo: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        products: productos,
      }),
      {
        status: 200,

        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {

    console.error(
      '🔥 ERROR OBTENIENDO PRODUCTOS:',
      error
    );

    return new Response(
      JSON.stringify({
        error:
          'No fue posible obtener los productos',
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


// =========================
// POST — CREAR PRODUCTO
// =========================

export const POST: APIRoute = async ({
  request,
}) => {

  try {

    const body = await request.json();

    const {
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      imagen,
    } = body;


    // =========================
    // VALIDACIONES
    // =========================

    if (
      !nombre ||
      precio === undefined
    ) {

      return new Response(
        JSON.stringify({
          error:
            'Nombre y precio son obligatorios',
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


    if (Number(precio) < 0) {

      return new Response(
        JSON.stringify({
          error:
            'El precio no puede ser negativo',
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
      stock !== undefined &&
      Number(stock) < 0
    ) {

      return new Response(
        JSON.stringify({
          error:
            'El stock no puede ser negativo',
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
    // CREAR PRODUCTO
    // =========================

    const producto =
      await prisma.product.create({

        data: {

          nombre:
            String(nombre).trim(),

          descripcion:
            descripcion
              ? String(descripcion).trim()
              : null,

          precio:
            Number(precio),

          stock:
            stock !== undefined
              ? Number(stock)
              : 0,

          categoria:
            categoria
              ? String(categoria).trim()
              : null,

          imagen:
            imagen
              ? String(imagen).trim()
              : null,

        },

      });


    console.log(
      '✅ Producto creado:',
      producto.id
    );


    return new Response(
      JSON.stringify({

        success: true,

        product: producto,

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
      '🔥 ERROR CREANDO PRODUCTO:',
      error
    );

    return new Response(
      JSON.stringify({
        error:
          'No fue posible crear el producto',
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

