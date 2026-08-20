import { NextResponse } from 'next/server';
import { handleCors, jsonResponse, checkDatabase } from '../../../utils';

export async function GET(request) {
  const cors = await handleCors(request);
  try {
    const databaseConnected = await checkDatabase();

    return jsonResponse(
      {
        success: databaseConnected,
        message: databaseConnected
          ? 'API funcionando correctamente'
          : 'Database connection failed',
        database: databaseConnected ? 'connected' : 'disconnected',
      },
      databaseConnected ? 200 : 500,
      cors.headers
    );
  } catch (error) {
    return jsonResponse(
      { success: false, message: 'Health check error' },
      500,
      cors.headers
    );
  }
}

export async function OPTIONS(request) {
  return handleCors(request);
}
