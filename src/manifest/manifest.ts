import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { Entry, EntryType, File, Folder } from './types.js';

export async function createManifest (dirPath: string) : Promise<Entry[]> {
  if (fs.existsSync(dirPath)) {
    const entries = fs.readdirSync(dirPath);

    const mappedEntries = await Promise.all(entries.map(async (e) => await mapEntry(e,dirPath)));

    return mappedEntries;
  } 
  return [];
}

async function mapEntry (entry: string, currentPath: string) : Promise<Folder | File> {
  const fullPath = path.join(currentPath, entry);
  const stats = fs.statSync(fullPath);

  if (stats.isDirectory()) {
    const entries = fs.readdirSync(fullPath);
    const mappedEntries: Entry[] = [];
    for (const e of entries) {
      mappedEntries.push(await mapEntry(e, fullPath));
    }

    return {
      type: EntryType.Folder,
      name: entry,
      files: mappedEntries
    };
  }

  const module = await import(pathToFileURL(fullPath).href);

  return {
    type: EntryType.File,
    name: entry,
    route: fullPath.replace(/\\/g, '/'),
    function: module.handler
  };
}
