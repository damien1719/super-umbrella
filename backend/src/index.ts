import app from './app';

const port = Number(process.env.PORT) || 8080;

// On bind sur 0.0.0.0 pour que Fly route le trafic dessus
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`[boot] 🌐 Server listening on 0.0.0.0:${port}`);
});

// graceful shutdown pour déploiements CC
const shutdown = (signal: string) => {
  console.log(`[shutdown] Received ${signal}, closing HTTP server…`);
  server.close(async (err?: Error) => {
    if (err) {
      console.error('[shutdown] Error while closing server:', err);
      process.exitCode = 1;
    }
    try {
      // if (prisma) await prisma.$disconnect();
    } catch (e) {
      console.error('[shutdown] Error while disconnecting Prisma:', e);
    } finally {
      process.exit();
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));