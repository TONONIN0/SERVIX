import { createHash } from 'node:crypto';
import prisma from './prisma';


// =====================================================
// CONFIGURACIÓN
// =====================================================

const TIEMPO_INACTIVIDAD =
  30 * 60 * 1000; // 30 minutos

const TIEMPO_MAXIMO_SESION =
  7 * 24 * 60 * 60 * 1000; // 7 días


// =====================================================
// OBTENER SESIÓN
// =====================================================

export async function obtenerSesion(
  cookies: any
) {

  // =========================
  // OBTENER COOKIE
  // =========================

  const session =
    cookies.get(
      'servix_session'
    );


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

        id: true,

        userId: true,

        tokenHash: true,

        createdAt: true,

        updatedAt: true,

        expiresAt: true,

        user: {

          select: {

            id: true,

            nombre: true,

            email: true,

          },

        },

      },

    });


  // =========================
  // SESIÓN NO EXISTE
  // =========================

  if (!sesion) {

    cookies.delete(
      'servix_session',
      {
        path: '/',
      }
    );

    return null;

  }


  const ahora =
    Date.now();


  // =========================
  // VERIFICAR EXPIRACIÓN
  // ABSOLUTA — 7 DÍAS
  // =========================

  const expiracionMaxima =
    sesion.createdAt.getTime() +
    TIEMPO_MAXIMO_SESION;


  if (
    ahora >=
    expiracionMaxima
  ) {

    console.log(
      '⏰ Sesión expirada por superar los 7 días'
    );


    await prisma.session.delete({
      where: {
        id: sesion.id,
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


  // =========================
  // VERIFICAR EXPIRESAT
  // =========================

  if (
    ahora >=
    sesion.expiresAt.getTime()
  ) {

    console.log(
      '⏰ Sesión expirada'
    );


    await prisma.session.delete({
      where: {
        id: sesion.id,
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


  // =========================
  // VERIFICAR INACTIVIDAD
  // =========================

  const ultimaActividad =
    sesion.updatedAt.getTime();


  const tiempoInactivo =
    ahora -
    ultimaActividad;


  if (
    tiempoInactivo >=
    TIEMPO_INACTIVIDAD
  ) {

    console.log(
      '⏰ Sesión cerrada por 30 minutos de inactividad'
    );


    await prisma.session.delete({
      where: {
        id: sesion.id,
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


  // =========================
  // ACTUALIZAR ACTIVIDAD
  // =========================

  await prisma.session.update({

    where: {
      id: sesion.id,
    },

    data: {
      updatedAt:
        new Date(),
    },

  });


  // =========================
  // SESIÓN VÁLIDA
  // =========================

  return {

    session:
      sesion,

    user:
      sesion.user,

    userId:
      sesion.userId,

  };

}

