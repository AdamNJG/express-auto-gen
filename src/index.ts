import express from 'express';
import EndpointGenerator from './endpointGenerator/endpointGenerator.js';
import * as path from 'path';

export const app = express();
const port = 3000;
const dirPath = './bff_functions';
const endpoints = './endpoints/endpoints.js';

(async () => {
  const endpointGenerator = await EndpointGenerator.create(dirPath, path.resolve(endpoints));

  const router = await endpointGenerator.getRouter();

  if (router) {
    app.use('/_api', router);
  }

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
})();
