const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });

  const DB_HOST = envVars.DB_HOST || 'localhost';
  const DB_PORT = parseInt(envVars.DB_PORT || '3306', 10);
  const DB_USER = envVars.DB_USER || 'root';
  const DB_PASSWORD = envVars.DB_PASSWORD || '';
  const DB_NAME = envVars.DB_NAME || 'sisley_platform';

  console.log('============================================================');
  console.log('SISLEY COLOMBIA - MIGRATE');
  console.log('============================================================');
  console.log(`Host: ${DB_HOST}:${DB_PORT}`);
  console.log(`Database: ${DB_NAME}`);
  console.log('============================================================\n');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
      connectTimeout: 10000
    });

    console.log('[OK] Conexión a MySQL establecida.\n');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');

    if (!fs.existsSync(schemaPath)) {
      throw new Error('No se encontró database/schema.sql');
    }
    if (!fs.existsSync(seedPath)) {
      throw new Error('No se encontró database/seed.sql');
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    console.log('[INFO] Ejecutando schema.sql...');
    await connection.query(schemaSQL);
    console.log('[OK] schema.sql ejecutado correctamente.\n');

    console.log('[INFO] Ejecutando seed.sql...');
    await connection.query(seedSQL);
    console.log('[OK] seed.sql ejecutado correctamente.\n');

    console.log('============================================================');
    console.log('MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('============================================================');
    console.log(`Base de datos: ${DB_NAME}`);
    console.log('============================================================\n');

  } catch (error) {
    console.error('\n[ERROR] Fallo en la migración:');
    console.error(error.message);
    if (error.sql) {
      console.error('\nSQL que causó el error:');
      console.error(error.sql);
    }
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
      console.log('[INFO] Conexión cerrada.');
    }
  }
}

main();
