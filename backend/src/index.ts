import app from './app';

const port = Number(process.env.PORT) || 3000;

// On bind sur 0.0.0.0 pour que Fly route le trafic dessus
app.listen(port, '0.0.0.0', () => {
  console.log(`[boot] 🌐 Server listening on 0.0.0.0:${port}`);
});