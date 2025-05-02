import { client } from '@/db';
import fs from 'fs';
import path from 'path';

// Leer el archivo de migración
async function main() {
  try {
    console.log('Iniciando migración de Turso...');

    // Lista de archivos a migrar
    const migrationFiles = [
      'migrations/001_initial.sql',
      'migrations/002_password_resets.sql',
      'migrations/003_service_passwords.sql',
      'migrations/004_franchises.sql',
    ];

    for (const migrationFile of migrationFiles) {
      const migrationPath = path.join(process.cwd(), migrationFile);

      if (!fs.existsSync(migrationPath)) {
        console.warn(`Archivo de migración no encontrado: ${migrationPath}`);
        continue;
      }

      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      // Separar las sentencias SQL (ignorando las líneas de comentarios y vacías)
      const statements = migrationSQL
        .split(';')
        .map((stmt) => stmt.trim())
        .filter(
          (stmt) =>
            stmt.length > 0 &&
            !stmt.startsWith('--') &&
            stmt !== 'BEGIN TRANSACTION' &&
            stmt !== 'COMMIT',
        );

      console.log(
        `Encontradas ${statements.length} sentencias SQL para ejecutar en ${migrationFile}`,
      );

      // Ejecutar cada sentencia por separado
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        console.log(
          `Ejecutando sentencia ${i + 1}/${statements.length}: ${stmt.substring(
            0,
            60,
          )}...`,
        );
        try {
          await client.execute(stmt);
          console.log(`✓ Sentencia ${i + 1} ejecutada correctamente`);
        } catch (error) {
          console.error(`✗ Error en sentencia ${i + 1}:`, error);
          throw error;
        }
      }
    }

    console.log('Migración completada exitosamente!');
  } catch (error) {
    console.error('Error al ejecutar la migración:', error);
    process.exit(1);
  }
}

main();
