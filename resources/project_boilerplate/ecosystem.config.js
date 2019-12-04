module.exports = {
    /**
     * Application configuration section
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    apps: [
        {
            name: 'cloud-function',
            script: 'index.js',
            watch: ["functions"],
            instances: "max",
            exec_mode: "cluster",
            max_memory_restart: "128M",
            env: {
                COMMON_VARIABLE: 'true'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        },
    ],

};
