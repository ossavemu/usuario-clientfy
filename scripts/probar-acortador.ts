import fetch from 'node-fetch';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const BASE_URL = 'http://localhost:3000';

interface ShortUrlResponse {
  longUrl: string;
  shortUrl: string;
  slug: string;
  success?: boolean;
  error?: string;
}

async function createShortUrl(longUrl: string, slug: string) {
  try {
    console.log(`\nCreando enlace acortado para: ${longUrl}`);
    console.log(`Con slug: ${slug}`);

    const response = await fetch(`${BASE_URL}/api/appointment/shortener`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ longUrl, slug }),
    });

    const data = (await response.json()) as ShortUrlResponse;

    if (!response.ok) {
      console.error(`Error (${response.status}):`, data);
      return null;
    }

    console.log('\nEnlace acortado creado exitosamente:');
    console.log(`URL Original: ${data.longUrl}`);
    console.log(`URL Acortada: ${data.shortUrl}`);
    console.log(`Slug: ${data.slug}`);
    console.log(`\nPrueba tu enlace acortado en: ${data.shortUrl}`);
    return data;
  } catch (error) {
    console.error('Error al crear enlace acortado:', error);
    return null;
  }
}

async function getShortUrl(slug: string) {
  try {
    console.log(`\nConsultando enlace con slug: ${slug}`);

    const response = await fetch(
      `${BASE_URL}/api/appointment/shortener?slug=${slug}`,
    );
    const data = (await response.json()) as ShortUrlResponse;

    if (!response.ok) {
      console.error(`Error (${response.status}):`, data);
      return null;
    }

    console.log('\nInformación del enlace:');
    console.log(`URL Original: ${data.longUrl}`);
    console.log(`Slug: ${data.slug}`);
    console.log(`URL Completa: ${BASE_URL}/s/${data.slug}`);
    return data;
  } catch (error) {
    console.error('Error al obtener enlace:', error);
    return null;
  }
}

function shortenerMenu() {
  console.log('\n===== MENU ACORTADOR DE URLS =====');
  console.log('1. Crear enlace acortado');
  console.log('2. Consultar enlace acortado');
  console.log('0. Salir');
  console.log('==================================');

  rl.question('Selecciona una opción: ', async (option) => {
    switch (option) {
      case '1':
        rl.question('URL que deseas acortar: ', (longUrl) => {
          rl.question('Slug personalizado: ', async (slug) => {
            await createShortUrl(longUrl, slug);
            shortenerMenu();
          });
        });
        break;

      case '2':
        rl.question('Slug a consultar: ', async (slug) => {
          await getShortUrl(slug);
          shortenerMenu();
        });
        break;

      case '0':
        console.log('¡Hasta pronto!');
        rl.close();
        break;

      default:
        console.log('Opción inválida, intenta de nuevo.');
        shortenerMenu();
        break;
    }
  });
}

// Ejemplo de URL para probar - Cita con Calendly
const ejemploUrl = `${BASE_URL}/appointment?hostNumber=573146858510&email=ejemplo%40correo.com&name=Usuario`;

console.log('===== PRUEBA DE ACORTADOR DE URLS =====');
console.log(`\nEjemplo de URL para acortar:\n${ejemploUrl}`);
console.log(
  '\nPuedes usar esta URL de ejemplo o introducir la tuya propia en el menú.',
);

shortenerMenu();
