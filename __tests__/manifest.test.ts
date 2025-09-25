import { describe, test, expect } from 'vitest';
import { createManifest } from '../src/manifest/manifest';
import { EntryType, Entry, File, Folder, ExpressFunction } from '../src/manifest/types';
import { Request } from 'express';

describe('stuff', () => {
  test('js handlers present, creates valid manifest', async () => {
    const baseRouteName = 'index.js';
    const folder1ExpectedName = 'test';
    const testBffPath = '__tests__/test_bff';

    const result = await createManifest(`./${testBffPath}`);

    expect(Array.isArray(result)).toBeTruthy();
    const file1: File = expectFile(result[0]);
    expect(file1.name).toBe(baseRouteName);
    expect(file1.route).toBe(`${testBffPath}/${baseRouteName}`);
    checkHandlerFunction(file1.function, 'this is the base route');
    
    const folder1: Folder = expectFolder(result[1]);
    expect(folder1.name).toBe(folder1ExpectedName);
    expect(folder1.files.length).toBe(1);

    const file2 = expectFile(folder1.files[0]);
    expect(file2.name).toBe(baseRouteName);
    expect(file2.route).toBe(`${testBffPath}/${folder1ExpectedName}/${baseRouteName}`);
    checkHandlerFunction(file2.function, 'this is /test/test');
  });

  test('no js handlers present, creates empty manifest', async () => {
    const result = await createManifest(`./no_handlers`);

    expect(Array.isArray(result)).toBeTruthy();
    expect(result.length).toBe(0);
  });
});

function expectFile (entry: Entry) : File {
  expect(entry.type).toBe(EntryType.File);
  return entry as File;
}

function expectFolder (entry: Entry): Folder {
  expect(entry.type).toBe(EntryType.Folder);
  return entry as Folder;
}

function checkHandlerFunction<T> (fun: ExpressFunction, expected: T) {
  let body: T | undefined;

  const req = {} as Request;
  const res = {
    send: (data: any) => {
      body = data;
    }
  } as any;

  fun(req, res);

  expect(body).toBeDefined();
  expect(body).toBe(expected);
}