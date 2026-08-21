import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(
  import.meta.env.RESEND_API_KEY
);

export const POST: APIRoute = async ({
  request,
}) => {

  try {

    // =========================
    // LEER DATOS
    // =========================

    const body = await request.json();

    const {
      nombre,
      email,
      telefono,
      asunto,
      mensaje,
    } = body;


    // =========================
    // VALIDAR DATOS
    // =========================

    if (
      !nombre ||
      !email ||
      !asunto ||
      !mensaje
    ) {

      return new Response(
        JSON.stringify({
          error:
            'Nombre, correo, asunto y mensaje son obligatorios.',
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
    // NORMALIZAR
    // =========================

    const nombreLimpio =
      String(nombre).trim();

    const emailLimpio =
      String(email)
        .trim()
        .toLowerCase();

    const telefonoLimpio =
      String(telefono || '').trim();

    const asuntoLimpio =
      String(asunto).trim();

    const mensajeLimpio =
      String(mensaje).trim();


    // =========================
    // VALIDAR EMAIL
    // =========================

    const emailValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        emailLimpio
      );

    if (!emailValido) {

      return new Response(
        JSON.stringify({
          error:
            'El correo electrónico no es válido.',
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
    // TRADUCIR ASUNTO
    // =========================

    const asuntos: Record<string, string> = {

      cotizacion:
        'Solicitar cotización',

      producto:
        'Buscar un producto',

      pedido:
        'Información sobre mi pedido',

      empresa:
        'Atención empresarial',

      otro:
        'Otro',

    };


    const asuntoTexto =
      asuntos[asuntoLimpio] ||
      asuntoLimpio;


    // =========================
    // LOG
    // =========================

    console.log(
      '📩 Nuevo mensaje de contacto'
    );

    console.log({
      nombre: nombreLimpio,
      email: emailLimpio,
      telefono: telefonoLimpio,
      asunto: asuntoTexto,
    });


    // =========================
    // ENVIAR CORREO
    // =========================

    const { data, error } =
      await resend.emails.send({

        /*
         * IMPORTANTE:
         *
         * Mientras estés probando puedes
         * utilizar el remitente de prueba
         * que te proporciona Resend.
         *
         * Cuando verifiques tu dominio,
         * cambia esto por:
         *
         * SERVIX <contacto@tudominio.com>
         */

        from:
          'SERVIX <onboarding@resend.dev>',

        /*
         * AQUÍ VA EL CORREO QUE RECIBIRÁ
         * LOS MENSAJES.
         *
         * Cámbialo por tu correo real.
         */

        to: [
          'marco.vema.2005@gmail.com',
        ],

        subject:
          `Contacto SERVIX — ${asuntoTexto}`,

        html: `

          <!DOCTYPE html>

          <html lang="es">

          <head>

            <meta charset="UTF-8">

            <title>
              Nuevo mensaje de contacto SERVIX
            </title>

          </head>

          <body
            style="
              margin:0;
              padding:0;
              background:#07111f;
              font-family:Arial, Helvetica, sans-serif;
              color:#f5f7fa;
            "
          >

            <div
              style="
                max-width:650px;
                margin:40px auto;
                background:#0d1a2b;
                border-radius:16px;
                overflow:hidden;
              "
            >

              <!-- HEADER -->

              <div
                style="
                  padding:30px;
                  background:#07111f;
                  border-bottom:1px solid #24364d;
                "
              >

                <h1
                  style="
                    margin:0;
                    font-size:28px;
                    color:#f5f7fa;
                  "
                >
                  SERVI<span
                    style="color:#6FBE44;"
                  >X</span>
                </h1>

                <p
                  style="
                    margin:8px 0 0;
                    color:#aeb9c8;
                    font-size:14px;
                  "
                >
                  Nuevo mensaje desde el formulario
                  de contacto.
                </p>

              </div>


              <!-- CONTENIDO -->

              <div
                style="
                  padding:30px;
                "
              >

                <div
                  style="
                    margin-bottom:22px;
                  "
                >

                  <p
                    style="
                      margin:0 0 6px;
                      color:#6FBE44;
                      font-size:12px;
                      font-weight:bold;
                      text-transform:uppercase;
                    "
                  >
                    Nombre
                  </p>

                  <p
                    style="
                      margin:0;
                      font-size:16px;
                    "
                  >
                    ${nombreLimpio}
                  </p>

                </div>


                <div
                  style="
                    margin-bottom:22px;
                  "
                >

                  <p
                    style="
                      margin:0 0 6px;
                      color:#6FBE44;
                      font-size:12px;
                      font-weight:bold;
                      text-transform:uppercase;
                    "
                  >
                    Correo electrónico
                  </p>

                  <p
                    style="
                      margin:0;
                      font-size:16px;
                    "
                  >
                    ${emailLimpio}
                  </p>

                </div>


                <div
                  style="
                    margin-bottom:22px;
                  "
                >

                  <p
                    style="
                      margin:0 0 6px;
                      color:#6FBE44;
                      font-size:12px;
                      font-weight:bold;
                      text-transform:uppercase;
                    "
                  >
                    Teléfono
                  </p>

                  <p
                    style="
                      margin:0;
                      font-size:16px;
                    "
                  >
                    ${
                      telefonoLimpio ||
                      'No proporcionado'
                    }
                  </p>

                </div>


                <div
                  style="
                    margin-bottom:22px;
                  "
                >

                  <p
                    style="
                      margin:0 0 6px;
                      color:#6FBE44;
                      font-size:12px;
                      font-weight:bold;
                      text-transform:uppercase;
                    "
                  >
                    Asunto
                  </p>

                  <p
                    style="
                      margin:0;
                      font-size:16px;
                    "
                  >
                    ${asuntoTexto}
                  </p>

                </div>


                <div>

                  <p
                    style="
                      margin:0 0 6px;
                      color:#6FBE44;
                      font-size:12px;
                      font-weight:bold;
                      text-transform:uppercase;
                    "
                  >
                    Mensaje
                  </p>

                  <div
                    style="
                      padding:18px;
                      background:#07111f;
                      border-radius:10px;
                      color:#d7dee8;
                      font-size:15px;
                      line-height:1.6;
                      white-space:pre-wrap;
                    "
                  >
                    ${mensajeLimpio}
                  </div>

                </div>

              </div>


              <!-- FOOTER -->

              <div
                style="
                  padding:20px 30px;
                  background:#07111f;
                  color:#718096;
                  font-size:12px;
                "
              >

                Mensaje enviado desde
                <strong
                  style="color:#6FBE44;"
                >
                  SERVIX
                </strong>.

              </div>

            </div>

          </body>

          </html>

        `,

        /*
         * Permite responder directamente
         * al cliente desde tu correo.
         */

        replyTo:
          emailLimpio,

      });


    // =========================
    // ERROR RESEND
    // =========================

    if (error) {

      console.error(
        '🔥 ERROR RESEND:',
        error
      );

      return new Response(
        JSON.stringify({
          error:
            'No fue posible enviar el correo.',
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


    // =========================
    // ÉXITO
    // =========================

    console.log(
      '✅ Correo enviado:',
      data?.id
    );


    return new Response(
      JSON.stringify({

        success: true,

        message:
          'Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.',

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
      '🔥 ERROR CONTACTO:',
      error
    );


    return new Response(
      JSON.stringify({
        error:
          'Error interno del servidor.',
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

