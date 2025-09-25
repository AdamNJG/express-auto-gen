import express from 'express';
import { createManifest } from './manifest.js';

const app = express();
const port = 3000;

(async () => {
  const manifest = await createManifest();


    manifest.map(f => {
        if (!f.files) {
            const endpointName = f.name.includes("index.js") ? "" : f.name.replace('.js', '')

            app.get(`/${endpointName}`, f.function);
            console.log(`/${endpointName} added`);
        } else {
            f.files.map(file => {
            const endpointName = file.name.includes("index.js") ? "" : file.name.replace('.js', '')
            app.get(`/${f.name}/${endpointName}`, file.function);
            console.log(`/${f.name}/${endpointName} added`);
            })

        }
    });

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    })
})();
/*app.get('/', (req, res) => {
  res.send('Hello World!')
})*/

