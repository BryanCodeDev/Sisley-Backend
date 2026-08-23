const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (error) {
    // dotenv no disponible
  }
}

function parseSqlStatements(sql) {
  const statements = [];
  let current = '';
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    if (inBlockComment) {
      if (sql[i] === '*' && sql[i + 1] === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (sql[i] === '-' && sql[i + 1] === '-') {
      while (i < sql.length && sql[i] !== '\n') i++;
      continue;
    }

    if (sql[i] === '/' && sql[i + 1] === '*') {
      inBlockComment = true;
      i++;
      continue;
    }

    current += sql[i];

    if (sql[i] === ';') {
      statements.push(current.trim());
      current = '';
    }
  }

  const trimmed = current.trim();
  if (trimmed) {
    statements.push(trimmed);
  }

  return statements.filter(s => s.length > 0);
}

async function main() {
  const DB_HOST = process.env.DB_HOST || process.env.MYSQLHOST;
  const DB_PORT = parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306', 10);
  const DB_USER = process.env.DB_USER || process.env.MYSQLUSER || 'root';
  const DB_PASSWORD = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';
  const DB_NAME = process.env.DB_NAME || process.env.MYSQL_DATABASE || 'railway';
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const FORCE_RESET = process.env.FORCE_RESET === 'true';

  const missing = [];
  if (!DB_HOST) missing.push('DB_HOST/MYSQLHOST');
  if (!DB_USER) missing.push('DB_USER/MYSQLUSER');
  if (!DB_PASSWORD && DB_PASSWORD !== '') missing.push('DB_PASSWORD/MYSQLPASSWORD');
  if (!DB_NAME) missing.push('DB_NAME/MYSQL_DATABASE');

  if (missing.length > 0) {
    console.error('\n[ERROR] Faltan variables de base de datos requeridas:');
    missing.forEach((v) => console.error(` - ${v}`));
    console.error('\nConfiguralas en Railway → backend → Variables,');
    console.error('o vinculá el servicio MySQL al backend.\n');
    process.exitCode = 1;
    return;
  }

  console.log('============================================================');
  console.log('SISLEY COLOMBIA - MIGRATE');
  console.log('============================================================');
  console.log(`[INFO] Environment: ${NODE_ENV}`);
  console.log(`[INFO] Database: ${DB_NAME}`);
  console.log(`[INFO] DB_HOST: ${DB_HOST}`);
  console.log(`[INFO] DB_PORT: ${DB_PORT}`);
  console.log(`[INFO] DB_USER: ${DB_USER}`);
  console.log(`[INFO] FORCE_RESET: ${FORCE_RESET}`);
  console.log(`[INFO] FRONTEND_URL: ${process.env.FRONTEND_URL || '(not set)'}`);
  console.log(`[INFO] NEXT_PUBLIC_FRONTEND_URL: ${process.env.NEXT_PUBLIC_FRONTEND_URL || '(not set)'}`);
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
      throw new Error('No se encontró database1/schema.sql');
    }
    if (!fs.existsSync(seedPath)) {
      throw new Error('No se encontró database1/seed.sql');
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    const schemaStatements = parseSqlStatements(schemaSQL);
    const setupStatements = [];
    const tableStatements = [];
    const targetDB = DB_NAME;

    for (const stmt of schemaStatements) {
      const upper = stmt.toUpperCase();

      if (upper.startsWith('DROP DATABASE') || upper.startsWith('CREATE DATABASE') || upper.startsWith('USE ')) {
        continue;
      }

      if (upper.startsWith('CREATE TABLE')) {
        if (FORCE_RESET) {
          const tableNameMatch = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?/i);
          if (tableNameMatch) {
            setupStatements.push(`DROP TABLE IF EXISTS \`${tableNameMatch[1]}\``);
          }
        }
        tableStatements.push(stmt.replace(/CREATE\s+TABLE\s+`?(\w+)`?/i, 'CREATE TABLE IF NOT EXISTS `$1`'));
        continue;
      }

      setupStatements.push(stmt);
    }

    console.log(`[INFO] BD objetivo: ${targetDB}`);
    console.log('[INFO] Ejecutando setup de base de datos...');
    for (const sql of setupStatements) {
      if (!sql.trim()) continue;
      await connection.query(sql + ';');
    }
    console.log('[OK] Setup de base de datos ejecutado correctamente.\n');

    if (tableStatements.length > 0) {
      console.log('[INFO] Ejecutando tablas...');
      for (const sql of tableStatements) {
        if (!sql.trim()) continue;
        await connection.query(sql + ';');
      }
      console.log(`[OK] Tablas procesadas correctamente: ${tableStatements.length}\n`);
    }

    console.log('[INFO] Verificando estado de la base de datos...');
    const [existingTablesRows] = await connection.query('SHOW TABLES');
    const existingTableNames = existingTablesRows.map(row => Object.values(row)[0]);

    const [roleCountRows] = await connection.query('SELECT COUNT(*) AS total FROM roles');
    const roleCount = roleCountRows[0] ? parseInt(roleCountRows[0].total, 10) : 0;
    const seedShouldRun = roleCount === 0;

    if (seedShouldRun) {
      console.log('[INFO] Datos base no encontrados, ejecutando seed.sql...');
      const seedStatements = parseSqlStatements(seedSQL);
      for (const sql of seedStatements) {
        if (!sql.trim()) continue;
        await connection.query(sql + ';');
      }
      console.log('[OK] seed.sql ejecutado correctamente.\n');
    } else {
      console.log(`[INFO] Seed omitido: la base de datos ya contiene datos (roles: ${roleCount}).\n`);
    }

    console.log('[INFO] Verificando tablas creadas...');
    const [tablesAfter] = await connection.query('SHOW TABLES');
    const tableCount = tablesAfter.length;
    console.log(`[INFO] Tablas encontradas en ${targetDB}: ${tableCount}`);

    const requiredTables = [
      'roles', 'permissions', 'role_permissions', 'users', 'customers',
      'shipping_addresses', 'categories', 'products', 'product_categories',
      'product_variants', 'product_images', 'stores', 'warehouses', 'store_users',
      'inventory', 'inventory_movements', 'stock_transfers',
      'carts', 'cart_items',
      'orders', 'order_items', 'order_status_history',
      'payments', 'payment_transactions', 'payment_webhooks',
      'invoices', 'invoice_items', 'credit_notes',
      'shipping_methods', 'promotions', 'coupons',
      'audit_logs', 'settings'
    ];

    const missingTables = requiredTables.filter(t => !existingTableNames.includes(t));
    if (missingTables.length > 0) {
      console.error('[ERROR] Faltan tablas críticas:');
      missingTables.forEach(t => console.error(` - ${t}`));
      throw new Error('Faltan tablas críticas después de la migración');
    }

    console.log('[OK] Todas las tablas críticas existen.\n');

    console.log('[INFO] Verificando datos mínimos...');
    const verifyTables = ['roles', 'users', 'categories', 'products', 'product_variants'];
    const counts = {};
    for (const table of verifyTables) {
      const [rows] = await connection.query(`SELECT COUNT(*) AS total FROM ${table}`);
      const total = rows[0] ? parseInt(rows[0].total, 10) : 0;
      counts[table] = total;
      console.log(`[VERIFY] ${table}: ${total}`);
    }

    const criticalEmpty = verifyTables.filter(t => counts[t] === 0);
    if (criticalEmpty.length > 0) {
      console.error('[ERROR] Faltan datos mínimos en tablas críticas:');
      criticalEmpty.forEach(t => console.error(` - ${t}`));
      throw new Error('Faltan datos mínimos después de la migración');
    }

    console.log('[OK] Datos mínimos verificados.\n');

    console.log('============================================================');
    console.log('MIGRACIÓN COMPLETADA EXITOSAMENTE');
    console.log('============================================================');
    console.log(`Base de datos: ${targetDB}`);
    console.log(`Tablas: ${tableCount}`);
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
