import fetch from 'node-fetch';

// Configuración
const BASE_URL = 'http://localhost:3000';
const SLUG = 'cita'; // Puedes cambiar esto por el slug que prefieras
const HOST_NUMBER = '573146858510';
const EMAIL = 'ejemplo@correo.com';
const NAME = 'Usuario';

// URL completa de la cita que queremos acortar
const citaUrl = `${BASE_URL}/appointment?hostNumber=${HOST_NUMBER}&email=${EMAIL}&name=${NAME}`;

interface ShortUrlResponse {
  longUrl: string;
  shortUrl: string;
  slug: string;
  success?: boolean;
  error?: string;
}

async function crearLinkCita() {
  try {
    console.log('Creando enlace corto para cita...');
    console.log(`URL original: ${citaUrl}`);
    console.log(`Slug a usar: ${SLUG}`);

    const response = await fetch(`${BASE_URL}/api/appointment/shortener`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        longUrl: citaUrl,
        slug: SLUG,
      }),
    });

    const data = (await response.json()) as ShortUrlResponse;

    if (!response.ok) {
      console.error(`Error (${response.status}):`, data);
      return;
    }

    console.log('\n✅ Enlace corto creado exitosamente:');
    console.log(`✨ URL acortada: ${data.shortUrl}`);
    console.log('\nPara acceder a la cita, visita:');
    console.log(`${BASE_URL}/s/${SLUG}`);
  } catch (error) {
    console.error('Error al crear el enlace corto:', error);
  }
}

// Ejecutar la función
crearLinkCita();
