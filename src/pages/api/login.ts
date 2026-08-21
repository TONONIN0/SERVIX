import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import {
  createHash,
  randomBytes,
} from 'node:crypto';

import prisma from '../../lib/prisma';

export const prerender = false;


// =====================================================
// LOGIN
// =====================================================

export const POST: APIRoute = async ({
  request,
  cookies,
}) => {

  try {

    console.log(
      '📥 Login recibido'
    );


    // =========================
    // BODY
    // =========================

    const body =
      await request.json();


    const {
      email,
      password,
    } = body;


    // =========================
    // VALIDAR DATOS
    // =========================

    if (
      !email ||
      !password
    ) {

      return new Response(

        JSON.stringify({

          error:
            'Correo y contraseña son obligatorios',

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
    // NORMALIZAR EMAIL
    // =========================

    const emailNormalizado =
      String(email)
        .toLowerCase()
        .trim();


    // =========================
    // BUSCAR USUARIO
    // =========================

    console.log(
      '🔎 Buscando usuario...'
    );


    const usuario =
      await prisma.user.findUnique({

        where: {

          email:
            emailNormalizado,

        },

      });


    if (!usuario) {

      return new Response(

        JSON.stringify({

          error:
            'Correo o contraseña incorrectos',

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
    // VERIFICAR CONTRASEÑA
    // =========================

    console.log(
      '🔐 Verificando contraseña...'
    );


    const passwordCorrecta =
      await bcrypt.compare(

        password,

        usuario.password

      );


    if (!passwordCorrecta) {

      return new Response(

        JSON.stringify({

          error:
            'Correo o contraseña incorrectos',

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
    // VERIFICAR EMAIL
    // =========================

    if (
      !usuario.emailVerified
    ) {

      console.log(
        '⚠️ Correo no verificado'
      );


      return new Response(

        JSON.stringify({

          error:
            'Debes verificar tu correo antes de iniciar sesión.',

          email:
            usuario.email,

          emailVerified:
            false,

        }),

        {

          status: 403,

          headers: {

            'Content-Type':
              'application/json',

          },

        }

      );

    }


    console.log(
      '✅ Correo verificado'
    );


    // =========================
    // TOKEN
    // =========================

    const token =
      randomBytes(32)
        .toString('hex');


    // =========================
    // HASH TOKEN
    // =========================

    const tokenHash =
      createHash('sha256')
        .update(token)
        .digest('hex');


    // =========================
    // FECHAS
    // =========================

    const ahora =
      new Date();


    const expiresAt =
      new Date(

        ahora.getTime() +
        7 *
        24 *
        60 *
        60 *
        1000

      );


    // =========================
    // ELIMINAR SESIONES
    // ANTERIORES
    // =========================

    await prisma.session.deleteMany({

      where: {

        userId:
          usuario.id,

      },

    });


    // =========================
    // CREAR SESIÓN
    // =========================

    await prisma.session.create({

      data: {

        userId:
          usuario.id,

        tokenHash,

        createdAt:
          ahora,

        updatedAt:
          ahora,

        expiresAt,

      },

    });


    console.log(
      '🔐 Sesión creada'
    );


    // =========================
    // COOKIE
    // =========================

    cookies.set(

      'servix_session',

      token,

      {

        httpOnly: true,

        secure:
          import.meta.env.PROD,

        sameSite:
          'lax',

        path:
          '/',

        maxAge:
          7 *
          24 *
          60 *
          60,

      }

    );


    // =========================
    // RESPUESTA
    // =========================

    console.log(
      '🎉 Login correcto'
    );


    return new Response(

      JSON.stringify({

        success:
          true,

        message:
          'Inicio de sesión correcto',

        user: {

          id:
            usuario.id,

          nombre:
            usuario.nombre,

          email:
            usuario.email,

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
      '🔥 ERROR LOGIN:',
      error
    );


    return new Response(

      JSON.stringify({

        error:
          'Error interno del servidor',

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

