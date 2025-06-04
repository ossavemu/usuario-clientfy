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
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const resolvedParams = await params; // Added this line
    const slug = resolvedParams.slug; // Changed this line
    if (!slug) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    const urlDatabase = readUrlDatabase();
    if (!urlDatabase[slug]) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.redirect(new URL(urlDatabase[slug]));
  } catch (error) {
    console.error('Error al redireccionar:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
