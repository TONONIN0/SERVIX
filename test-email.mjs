import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

try {
  const { data, error } = await resend.emails.send({
    from: 'SERVIX <onboarding@resend.dev>',
    to: ['marco.vema.2005@gmail.com'],
    subject: 'Prueba de correo SERVIX',
    html: `
      <h1>SERVIX</h1>

      <p>Este es un correo de prueba.</p>

      <p>
        Si estás viendo esto, Resend está funcionando correctamente.
      </p>
    `,
  });

  if (error) {
    console.error('❌ ERROR DE RESEND:');
    console.error(error);
    process.exit(1);
  }

  console.log('✅ CORREO ENVIADO');
  console.log(data);

} catch (error) {
  console.error('❌ ERROR COMPLETO:');
  console.error(error);
}