const fs = require('fs');
const path = require('path');
const {environment} = require("./src/environments/environment");

const env = process.env.NODE_ENV || 'production';

const envFilePath = path.join(__dirname, 'src/environments/environment.prod.ts');
const envFileContent = `
export const environment = {
  production: ${env === 'production'},
  apiUrl: '${process.env.API_URL || environment.apiUrl}'
};
`;

fs.writeFileSync(envFilePath, envFileContent, 'utf8');
