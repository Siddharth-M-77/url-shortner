// PM2 config. Start with: pm2 start ecosystem.config.cjs --env production
// The API counts clicks itself (RUN_CLICK_WORKER defaults to true), so "linkzy-worker"
// is only needed if you set RUN_CLICK_WORKER=false in backend/.env. Start just the API with:
//   pm2 start ecosystem.config.cjs --only linkzy-api --env production
// .cjs because PM2 config files are loaded with require()
module.exports = {
  apps: [
    {
      name: "linkzy-api",
      cwd: "./backend",
      script: "src/server.js",
      instances: "max", // one process per CPU core
      exec_mode: "cluster",
      max_memory_restart: "400M",
      kill_timeout: 10000, // give graceful shutdown time to finish
      env_production: { NODE_ENV: "production" },
    },
    {
      name: "linkzy-worker",
      cwd: "./backend",
      script: "src/workers/clickWorker.js",
      instances: 1, // BullMQ concurrency handles parallelism inside one process
      exec_mode: "fork",
      max_memory_restart: "300M",
      kill_timeout: 10000,
      env_production: { NODE_ENV: "production" },
    },
  ],
};
