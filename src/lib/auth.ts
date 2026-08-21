import crypto from 'node:crypto';
import prisma from './prisma';

export async function obtenerSesion(cookies: any) {
  const sessionCookie = cookies.get('servix_session');

  if (!sessionCookie) {
    return null;
  }

  const token = sessionCookie.value;

  if (!token) {
    return null;
  }

  // Convertimos el token en hash para buscarlo en la BD
  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        select: {
          id: true,
          nombre: true,
          email: true,
        },
      },
    },
  });

  // Token inexistente
  if (!session) {
    cookies.delete('servix_session', {
      path: '/',
    });

    return null;
  }

  // Token expirado
  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    cookies.delete('servix_session', {
      path: '/',
    });

    return null;
  }

  return {
    session,
    user: session.user,
    userId: session.userId,
  };
}

