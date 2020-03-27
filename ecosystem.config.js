module.exports = {
  apps : [{
    name: 'FCFS-BOT',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    shutdown_with_message: true,
    kill_timeout : 3000,
    time: true,
    env: {
      NODE_ENV: 'production',
      FCFS_BOT_TOKEN: 'YOUR TOKEN HERE'
    },
  }]
};
