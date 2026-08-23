const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const DB_HOST = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
  const DB_PORT = parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306', 10);
  const DB_USER = process.env.DB_USER || process.env.MYSQLUSER || 'root';
  const DB_PASSWORD = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';
  const DB_NAME = process.env.DB_NAME || process.env.MYSQL_DATABASE || 'sisley_platform';

  console.log('============================================================');
  console.log('SISLEY COLOMBIA - MIGRATE');
  console.log('============================================================');
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`DB_HOST: ${DB_HOST}`);
  console.log(`DB_PORT: ${DB_PORT}`);
  console.log(`DB_USER: ${DB_USER}`);
  console.log(`DB_NAME: ${DB_NAME}`);
  console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '(set)' : '(not set)'}`);
  console.log(`NEXT_PUBLIC_FRONTEND_URL: ${process.env.NEXT_PUBLIC_FRONTEND_URL}`);
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
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    if (error.code) console.error('Codigo:', error.code);
    if (error.errno) console.error('Errno:', error.errno);
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
