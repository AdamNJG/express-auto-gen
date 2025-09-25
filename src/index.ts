import express from 'express';
import { createManifest } from './manifest/manifest.js';
import { Entry, EntryType } from './manifest/types.js';

export const app = express();
const port = 3000;
const dirPath = './bff_functions';

(async () => {
  const manifest: Entry[] = await createManifest(dirPath);

  manifest.map((e: Entry) => {
    switch (e.type) {
    case EntryType.Folder:
      e.files.forEach((file: Entry) => {
        if (file.type === EntryType.File) { 
          const endpointName = file.name.includes('index.js') ? '' : file.name.replace('.js', '');
          app.get(`/_api/${e.name}/${endpointName}`, file.function);
          console.log(`/_api/${e.name}/${endpointName} added`);
        }
      });
      break;
    case EntryType.File: {
      const endpointName = e.name.includes('index.js') ? '' :e.name.replace('.js', '');

      app.get(`/_api/${endpointName}`, e.function);
      console.log(`/_api/${endpointName} added`);
      break;
    } 
    }
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
})();
