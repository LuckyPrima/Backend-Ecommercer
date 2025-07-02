module.exports = {
  apps: [
    {
      name: "api-server",
      script: "./server.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
      },
      time: true,
    },
  ],
  deploy: {
    production: {
      user: "root",
      host: ["31.97.186.29"],
      ref: "origin/main",
      repo: "git@github.com:LuckyPrima/Backend-Ecommercer.git",
      path: "/root/api-ecommercer",
      "pre-deploy-local": "",
      "post-deploy": `source ~/.nvm/nvm.sh && \
        npm install && \
        npm run build && \
        pm2 startOrRestart ecosystem.config.js && \
        sudo systemctl restart nginx`,
      "pre-setup": "",
    },
  },
};
