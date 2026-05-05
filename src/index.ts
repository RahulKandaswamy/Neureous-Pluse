import { createApp } from "./app.js";

const { app, env } = createApp();

try {
  await app.listen({
    port: env.PORT,
    host: "0.0.0.0"
  });
} catch (error) {
  app.log.error(error, "Failed to start server.");
  process.exitCode = 1;
}
