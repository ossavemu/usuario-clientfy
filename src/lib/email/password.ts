import { transporter } from './setup';

export const sendServicePasswordEmail = async (
  email: string,
  password: string,
) => {
  const mailOptions = {
    from: `ClientFy Asistentes Inteligentes <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🎉 Bienvenido a ClientFy - Tu Contraseña de Servicio',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6B46C1; margin: 0;">¡Bienvenido a ClientFy! 🚀</h1>
          <p style="color: #805AD5; font-size: 18px; margin-top: 10px;">Tu plataforma de Asistentes Inteligentes</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #4A5568;">
          ¡Felicitaciones! 🎊 Estás a un paso de comenzar a crear tus Asistentes Inteligentes.
        </p>

        <div style="background-color: #F3E8FF; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #E9D8FD;">
          <p style="margin: 0 0 10px 0; font-size: 16px; color: #553C9A;">Tu contraseña de servicio es:</p>
          <div style="background: white; padding: 15px; border-radius: 5px; position: relative;">
            <code style="font-family: 'Courier New', monospace; display: block; text-align: center; font-size: 24px; color: #6B46C1; margin: 0; letter-spacing: 2px;">
              ${password}
            </code>
          </div>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #4A5568;">
          Con esta contraseña podrás acceder a nuestra plataforma y comenzar a crear 
          asistentes virtuales personalizados para tu negocio. 🤖✨
        </p>

        <div style="background-color: #F3E8FF; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 16px; color: #553C9A; text-align: center;">
            ¿Necesitas ayuda? Estamos aquí para ti
          </p>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 25px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius: 5px; background-color: #6B46C1;">
                    <a href="mailto:soporte@clientfy.com.mx" 
                       style="color: #ffffff; display: inline-block; font-family: Arial, sans-serif;
                              font-size: 16px; font-weight: bold; line-height: 100%; padding: 12px 25px;
                              text-decoration: none;">
                      Contactar Soporte
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #E9D8FD; margin: 30px 0;">

        <p style="color: #805AD5; font-size: 14px; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} ClientFy - Transformando la atención al cliente
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email enviado exitosamente a:', email);
    return true;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw new Error('Error al enviar el email con la contraseña');
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
) => {
  const mailOptions = {
    from: `ClientFy Asistentes Inteligentes <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🔐 Restablecimiento de Contraseña - ClientFy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6B46C1; margin: 0;">Restablecimiento de Contraseña</h1>
          <p style="color: #805AD5; font-size: 18px; margin-top: 10px;">ClientFy - Asistentes Inteligentes</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #4A5568;">
          Has solicitado restablecer tu contraseña. Por favor, haz clic en el siguiente enlace para continuar:
        </p>

        <div style="background-color: #F3E8FF; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #E9D8FD;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border-radius: 5px; background-color: #6B46C1;">
                      <a href="${
                        process.env.NEXT_PUBLIC_BASE_URL
                      }/reset-password/${resetToken}" 
                         style="color: #ffffff; display: inline-block; font-family: Arial, sans-serif;
                                font-size: 16px; font-weight: bold; line-height: 100%; padding: 12px 25px;
                                text-decoration: none;">
                        Restablecer Contraseña
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #4A5568;">
          Este enlace expirará en 24 horas por seguridad. Si no solicitaste este restablecimiento, 
          puedes ignorar este correo.
        </p>

        <hr style="border: none; border-top: 1px solid #E9D8FD; margin: 30px 0;">

        <p style="color: #805AD5; font-size: 14px; text-align: center; margin: 0;">
          © ${new Date().getFullYear()} ClientFy - Transformando la atención al cliente
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email de restablecimiento enviado a:', email);
    return true;
  } catch (error) {
    console.error('Error al enviar email de restablecimiento:', error);
    throw new Error('Error al enviar el email de restablecimiento');
  }
};
