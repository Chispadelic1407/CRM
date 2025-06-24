module.exports = {
  apps: [{
    name: 'crm-twilio',
    script: 'backend/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DOMAIN: 'crm.sebastianvernis.com',
      VOICE_WEBHOOK_URL: 'https://crm.sebastianvernis.com'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      DOMAIN: 'crm.sebastianvernis.com',
      VOICE_WEBHOOK_URL: 'https://crm.sebastianvernis.com'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000
  }]
};
