import fs from 'fs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import path from 'path';

const SHORTENER_DB_PATH = path.join(process.cwd(), 'secrets/shortener.json');

// Función para leer la base de datos de URLs
function readUrlDatabase() {
  try {
    if (!fs.existsSync(SHORTENER_DB_PATH)) {
      return {};
    }
    const data = fs.readFileSync(SHORTENER_DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer la base de datos:', error);
    return {};
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } },
) {
  try {
    // Obtener el slug de forma segura
    const params = await context.params;
    const slug = params.slug;

    if (!slug) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Leer la base de datos
    const urlDatabase = readUrlDatabase();

    // Verificar si el slug existe
    if (!urlDatabase[slug]) {
      // Redireccionar a página principal si no existe
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Redireccionar a la URL original
    return NextResponse.redirect(new URL(urlDatabase[slug]));
  } catch (error) {
    console.error('Error al redireccionar:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
