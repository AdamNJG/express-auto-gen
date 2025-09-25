import { Request, Response, NextFunction } from 'express';

export const enum EntryType {
  File = 'File',
  Folder = 'Folder'
}
export type Folder = {
    type: EntryType.Folder
    name: string;
    files: Entry[];
}

export type File = {
    type: EntryType.File
    name: string;
    route: string;
    function: ExpressFunction;
}

export type Entry = File | Folder;

export type ExpressFunction = (req: Request, res: Response, next?: NextFunction) => any;