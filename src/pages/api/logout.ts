export const prerender = false;

export const POST = async ({ cookies, redirect }) => {

  cookies.delete('servix_session', {
    path: '/',
  });

  return redirect('/login');

};