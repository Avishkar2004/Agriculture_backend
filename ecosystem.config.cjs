module.exports = {
    apps: [
      {
        name: "my-app", // Name of your application
        script: "./App.js", // Entry point of your app
        instances: "max", // Use all available CPU cores
        exec_mode: "cluster", // Enable cluster mode
        env: {
          NODE_ENV: "development",
          PORT: 8080, // Default port for development
        },
        env_production: {
          NODE_ENV: "production",
          PORT: 8080, // Default port for production
        },
      },
    ],
  };

  // So this is run in Terminal and here is the resource for learn "https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/"