import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';
const dirPath = './bff_functions';


/*type Folder = {
    name: string;
    files: File[];
}

type File = {
    name: string;
}*/

export async function createManifest() {
    if (fs.existsSync(dirPath)) {
        const entries = fs.readdirSync(dirPath);

        const mappedEntries = await Promise.all(entries.map(async (e) => await mapEntry(e,dirPath)));

        console.log(JSON.stringify(mappedEntries));

        return mappedEntries;
    }
}

async function mapEntry(entry, currentPath) {
    const fullPath = path.join(currentPath, entry);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
        const entries = fs.readdirSync(fullPath);
        const mappedEntries = await Promise.all(entries.map(async(e) => await mapEntry(e, fullPath)));
        return {
            name: entry.replace(/\\/g, '/'),
            files: mappedEntries,
            route: fullPath.replace(/\\/g, '/')
        };
    }
    const moduleUrl = pathToFileURL(fullPath).href; // Convert to file:// URL
    const module = await import(moduleUrl);

    return {
        name: entry,
        route: fullPath.replace(/\\/g, '/'),
        function: module.handler
    };
}
