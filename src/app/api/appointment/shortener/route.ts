import { jsonError, jsonSuccess } from '@/lib/api/jsonResponse';
import fs from 'fs';
import type { NextRequest } from 'next/server';
import path from 'path';

const SHORTENER_DB_PATH = path.join(process.cwd(), 'secrets/shortener.json');

// Función para leer la base de datos de URLs
function readUrlDatabase() {
  try {
    if (!fs.existsSync(SHORTENER_DB_PATH)) {
      // Si el archivo no existe, crear la estructura inicial
      const dirPath = path.dirname(SHORTENER_DB_PATH);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(SHORTENER_DB_PATH, JSON.stringify({}, null, 2));
      return {};
    }
    const data = fs.readFileSync(SHORTENER_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer la base de datos:', error);
    return {};
  }
}

// Función para guardar la base de datos de URLs
function saveUrlDatabase(data: Record<string, string>) {
  try {
    const dirPath = path.dirname(SHORTENER_DB_PATH);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(SHORTENER_DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error al guardar la base de datos:', error);
    return false;
  }
}

// POST - Crear un nuevo enlace acortado
export async function POST(request: NextRequest) {
  try {
    const { url, slug } = await request.json();
    console.log('url', url);
    console.log('slug', slug);
    if (!url) return jsonError('URL larga es requerida', 400);
    if (!slug) return jsonError('Slug es requerido', 400);

    // Leer la base de datos actual
    const urlDatabase = readUrlDatabase();

    // Verificar si el slug ya existe
    if (urlDatabase[slug]) {
      return jsonError('Este slug ya está en uso', 400);
    }

    // Guardar el nuevo enlace acortado
    urlDatabase[slug] = url;
    saveUrlDatabase(urlDatabase);

    // Construir la URL acortada
    const host = 'https://usuario.clientfy.com.mx';
    const shortUrl = `${host}/s/${slug}`;

    return jsonSuccess({
      longUrl: url,
      shortUrl,
      slug,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : 'Error al crear el enlace acortado',
      500,
    );
  }
}

// GET - Obtener un enlace acortado
export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    const longUrl = request.nextUrl.searchParams.get('longUrl');

    // Verificar que se proporcionó al menos uno de los parámetros
    if (!slug && !longUrl) {
      return jsonError('Se requiere un slug o una URL larga', 400);
    }

    // Leer la base de datos
    const urlDatabase = readUrlDatabase();

    // Caso 1: Buscar por slug
    if (slug) {
      if (!urlDatabase[slug]) {
        return jsonError('Enlace no encontrado', 404);
      }

      return jsonSuccess({
        longUrl: urlDatabase[slug],
        slug,
        shortUrl: `${request.nextUrl.origin}/s/${slug}`,
      });
    }

    // Caso 2: Buscar por URL larga
    const foundSlug = Object.entries(urlDatabase).find(
      ([, url]) => url === longUrl,
    )?.[0];

    if (!foundSlug) {
      return jsonError('No existe un enlace acortado para esta URL', 404);
    }

    return jsonSuccess({
      longUrl,
      slug: foundSlug,
      shortUrl: `${request.nextUrl.origin}/s/${foundSlug}`,
    });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Error al obtener el enlace',
      500,
    );
  }
}
