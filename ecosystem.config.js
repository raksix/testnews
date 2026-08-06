module.exports = {
  apps: [
    {
      name: "testnews",
      cwd: "/root/testnews",
      script: ".next/standalone/server.js",
      env: { PORT: "3012", HOSTNAME: "0.0.0.0" },
      restart_delay: 3000,
      max_memory_restart: "600M",
    },
    {
      name: "testnews-backend",
      cwd: "/root/testnews/backend",
      script: "dist/index.js",
      restart_delay: 3000,
      max_memory_restart: "400M",
    },
  ],
};
