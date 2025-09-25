import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { Entry, EntryType, File, Folder } from './types.js';

const dirPath = './bff_functions';

export async function createManifest() : Promise<Entry[]> {
    if (fs.existsSync(dirPath)) {
        const entries = fs.readdirSync(dirPath);

        const mappedEntries = await Promise.all(entries.map(async (e) => await mapEntry(e,dirPath)));

        console.log(JSON.stringify(mappedEntries));

        return mappedEntries;
    } else {
        console.log(`${dirPath} not found`)
    }
    return [];
}

async function mapEntry(entry: string, currentPath: string) : Promise<Folder | File> {
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
            name: entry.replace(/\\/g, '/'),
            files: mappedEntries,
            //route: fullPath.replace(/\\/g, '/')
        };
    }

    const module = await import(pathToFileURL(fullPath.replace(/\.ts$/, '.js')).href);

    return {
        type: EntryType.File,
        name: entry,
        route: fullPath.replace(/\\/g, '/'),
        function: module.handler
    };
}
