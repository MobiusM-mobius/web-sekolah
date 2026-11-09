module.exports = {
  apps: [{
    name: "sdit-al-ikhlas",
    cwd: "/var/www/sdit-alikhlas",
    script: "node_modules/next/dist/bin/next",
    args: "start --hostname 127.0.0.1 --port 3000",
    interpreter: "node",
    instances: 2,
    exec_mode: "cluster",
    max_memory_restart: "1G",
    env_production: { NODE_ENV: "production" },
    listen_timeout: 10000,
    kill_timeout: 5000,
  }],
};
