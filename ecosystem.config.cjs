module.exports = {
  apps: [
    {
      name: 'bank-sampah',
      cwd: '/var/www/bank-sampah-app/current',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
