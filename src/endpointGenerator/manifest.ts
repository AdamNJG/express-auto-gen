import * as fs from 'fs';
import * as path from 'path';
import { File, HttpMethod } from './types.js';

export async function createManifest (dirPath: string) : Promise<File[]> {
  if (!fs.existsSync(dirPath)) return []; 
  
  const entries = fs.readdirSync(dirPath);
  const mappedEntries: File[] = [];

  for (const entry of entries.filter(e => e.endsWith('.json') === false)) { 
    mappedEntries.push(...await mapEntry(entry, dirPath));
  }

  return mappedEntries;
}

async function mapEntry (entry: string, currentPath: string, url: string = '') : Promise<File[]> {
  const fullPath = path.join(currentPath, entry);
  const stats = fs.statSync(fullPath);

  const files: File[] = [];
  url = url + `/${entry}`;

  if (stats.isDirectory()) {
    const subEntries = fs.readdirSync(fullPath);
    for (const e of subEntries.filter(e => e.endsWith('.json') == false)) {
      files.push(...await mapEntry(e, fullPath, url));
    }
  } else {
    files.push({
      name: entry,
      route: url.replace('index.js', '').replace('.js', ''),
      path: fullPath.replace(/\\/g, '/'),
      httpMethod: parseMethod(fullPath)
    });
  }

  return files;
}

function parseMethod (fullPath: string): HttpMethod {
  const dir = path.dirname(fullPath);
  const base = path.basename(fullPath, '.js');

  const configPath = path.join(dir, `${base}.json`);

  try {
    const json = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (json.method && HttpMethod[json.method.toUpperCase() as keyof typeof HttpMethod]) {
      return HttpMethod[json.method.toUpperCase() as keyof typeof HttpMethod];
    }
  } catch (err) {
    console.warn(`Failed to parse JSON for ${fullPath}:`, err);
  }

  return HttpMethod.GET;
}