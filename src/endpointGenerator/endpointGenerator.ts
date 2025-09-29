import { File } from './types.js';
import { promises as fs } from 'fs';
import * as path from 'path';
import { createManifest } from './manifest.js';
import { pathToFileURL } from 'url';
import { Router } from 'express';

type MappedEndpoint = {
  handler: string;
  routerDefinition: string;
};

export default class EndpointGenerator {
  private sourceDirectory: string;
  private outputPath: string;

  private constructor (dirPath: string, outputFilePath: string) { 
    this.sourceDirectory = dirPath;
    this.outputPath = outputFilePath;
  }

  static async create (dirPath: string, outputFilePath: string) : Promise<EndpointGenerator> {
    const endpointGenerator = new EndpointGenerator(dirPath, outputFilePath); 

    await endpointGenerator.generateEndpoints();

    return endpointGenerator;
  }

  async generateEndpoints () {
    const manifest: File[] = await createManifest(this.sourceDirectory);

    if (manifest.length == 0) {
      console.error(`No endpoints found to map for ${this.sourceDirectory}`);
      return;
    }

    const endpoints = await Promise.all(manifest.map(EndpointGenerator.mapFile));

    const routerDefinitions = endpoints.map(e => e.routerDefinition).join(';\n') + ';';

    const gen = `
import express from 'express';

${endpoints.map(e => e.handler).join('\n')}

const router = express.Router();

${routerDefinitions}

export default router;
    `;

    await fs.mkdir(path.dirname(this.outputPath), { recursive: true });
    await fs.writeFile(this.outputPath, gen, 'utf8');
    console.log(`generated endpoints: ${this.outputPath}`);
  }
  
  static async mapFile (file: File, index: number): Promise<MappedEndpoint> {
    const handlerName = `handler${index}`;
    const handlerPath = path.resolve(file.path);
    const handlerCode = await fs.readFile(handlerPath, 'utf8');

    /*const code = handlerCode.replace(/^\s*export\s+(default\s+)?(async\s+)?function\s+handler/,
      (match, defaultPart, asyncPart) => {
        return `${asyncPart ?? ''}function ${handlerName}`;
      });*/

    const code = handlerCode.replace(/^\s*export\s+(?:default\s+)?((?:async\s+)?function\s+)handler\b/m,
      `$1${handlerName}`);

    const handler = `${code}`;
 
    const routerDefinition = `router.${file.httpMethod.toLowerCase()}('${file.route}', ${handlerName})`;

    return {
      handler,
      routerDefinition
    };
  }
  
  async getRouter (): Promise<Router | undefined> {
    const absPath = path.resolve(this.outputPath);

    const fileUrl = pathToFileURL(absPath).href;

    try {
      const router = await import(fileUrl);
      if (router.default instanceof Router) {
        return router.default;
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }

    console.warn(`No router found in ${this.outputPath}`);
    return undefined;
  }
}

