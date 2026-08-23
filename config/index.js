if (typeof process !== 'undefined' && process.cwd && !process.env.NEXT_PUBLIC_SKIP_DOTENV) {
  try {
    require('dotenv').config();
  } catch (error) {
    // dotenv no disponible en Edge Runtime
  }
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  frontendUrl: process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  database: {
    host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306', 10),
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'sisley_platform',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me_in_production',
    expiresIn: '8h',
  },
  mercadopago: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
  },
  factus: {
    apiUrl: process.env.FACTUS_API_URL || '',
    apiKey: process.env.FACTUS_API_KEY || '',
  },
};
