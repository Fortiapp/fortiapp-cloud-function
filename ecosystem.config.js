module.exports = {
    apps: [
        {
            name: 'fortiapp-cloud-functions',
            script: './bin/www',
            env: {
                COMMON_VARIABLE: 'true'
            },
            env_production: {
                NODE_ENV: 'production'
            }
        }
    ],
};
