import { buildApp } from './app.ts';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  const server = buildApp();

  try {
    const address = await server.listen({ port: PORT, host: HOST });
    console.log(`====================================================`);
    console.log(`🚀 Rently Modular API & Ledger Engine Server Running`);
    console.log(`📍 Listening at: ${address}`);
    console.log(`📊 Health Check: ${address}/api/health`);
    console.log(`🏛️ Ledger Audit: ${address}/api/v1/ledger/audit`);
    console.log(`🚗 Catalog Hub:  ${address}/api/v1/catalog/listings`);
    console.log(`📍 Geo Hub:      ${address}/api/v1/geo/localities`);
    console.log(`====================================================`);
  } catch (err) {
    console.error('Failed to start Rently backend server:', err);
    process.exit(1);
  }
}

start();
