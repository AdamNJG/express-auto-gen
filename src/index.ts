import express from 'express';
import { createManifest } from './manifest/manifest.js';
import { File, Folder, Entry, EntryType } from './manifest/types.js';

export const app = express();
const port = 3000;

(async () => {
  const manifest: Entry[] = await createManifest();

  console.log(manifest);

  manifest.map((e: Entry) => {
    switch (e.type) {
      case EntryType.Folder:
       // mapFolder(e);
          e.files.forEach((file: Entry) => {
          if (file.type === EntryType.File){
            const endpointName = file.name.includes("index.js") ? "" : file.name.replace('.js', '')
            app.get(`/${e.name}/${endpointName}`, file.function);
            console.log(`/${e.name}/${endpointName} added`);
          }
          })
        break;
      case EntryType.File:
          const endpointName = e.name.includes("index.js") ? "" :e.name.replace('.js', '')

          app.get(`/${endpointName}`, e.function);
          console.log(`/${endpointName} added`);
        break;
    }
  });

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
})();
/*function mapFolder (f: Folder){
  f.files.forEach((e: Entry) => {
    switch (e.type) {
      case EntryType.Folder:
        mapFolder(e)
        break;
      case EntryType.File:
        const endpointName = e.name.includes("index.js") ? "" : f.name.replace('.js', '')

        app.get(`/${endpointName}`, e.function);
        console.log(`/${endpointName} added`);
    }
  })
}

function mapFile(f: File){ 
  const endpointName = f.name.includes("index") ? "" : f.name.replace('.js', '')

  app.get(`/${endpointName}`, f.function);
  console.log(`/${endpointName} added`);
}*/
