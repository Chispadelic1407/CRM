module.exports = {
  apps: [{
    name: 'crm-avanza',
    script: './backend/server.js',
    cwd: '/root/crm-consolidated',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './backend/logs/pm2-err.log',
    out_file: './backend/logs/pm2-out.log',
    log_file: './backend/logs/pm2-combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000
  }]
};
