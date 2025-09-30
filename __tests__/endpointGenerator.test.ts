import { describe, test, expect, afterEach, beforeEach, vi } from 'vitest';
import EndpointGenerator from '../src/endpointGenerator/endpointGenerator';
import { IRoute, NextFunction, Request, Response } from 'express';
import { rm } from 'fs/promises';

describe('stuff', () => {
  const endpointBasePath = './__tests__/endpoints';
  let errorMock: ReturnType<typeof vi.spyOn>;
  let warnMock: ReturnType<typeof vi.spyOn>;
  let logMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnMock = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logMock = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    errorMock.mockRestore();
    warnMock.mockRestore();
    logMock.mockRestore();
  });

  test('js handlers present no configs, creates router with all get methods', async () => {
    const uniqueSuffix = Date.now() + Math.random().toString(36).slice(2);
    const endpointPath = `${endpointBasePath}_${uniqueSuffix}.js`;
    const testBffPath = '__tests__/test_bff';

    const endpointGenerator = await EndpointGenerator.create(`./${testBffPath}`, endpointPath);

    const router = await endpointGenerator.getRouter();
    if (!router) {
      await deleteFile(endpointPath);
      throw Error('router undefined');
    }

    expectRoute(router.stack[0], '/', 'get', 'this is the base route');

    expectRoute(router.stack[1], '/test/', 'get', 'this is /test/');

    expectRoute(router.stack[2], '/test/test', 'get', 'this is /test/test');

    expect(logMock).toBeCalledWith(`generated endpoints: ${endpointPath}`);

    await deleteFile(endpointPath);
  });

  test('js handlers present with configs, creates valid router with different methods', async () => {
    const uniqueSuffix = Date.now() + Math.random().toString(36).slice(2);
    const endpointPath = `${endpointBasePath}_${uniqueSuffix}.js`;
    const testBffPath = '__tests__/test_bff_config';

    const endpointGenerator = await EndpointGenerator.create(`./${testBffPath}`, endpointPath);

    const router = await endpointGenerator.getRouter();
    if (!router) {
      await deleteFile(endpointPath);
      throw Error('router undefined');
    }

    expectRoute(router.stack[0], '/', 'post', 'this is the base route');

    expectRoute(router.stack[1], '/test/', 'put', 'this is /test/');

    expectRoute(router.stack[2], '/test/test', 'patch', 'this is /test/test');

    await deleteFile(endpointPath);
  });

  test('js handlers present with invalid configs, creates valid router with different methods', async () => {
    const uniqueSuffix = Date.now() + Math.random().toString(36).slice(2);
    const endpointPath = `${endpointBasePath}_${uniqueSuffix}.js`;
    const testBffPath = '__tests__/test_bff_invalid_config';

    const endpointGenerator = await EndpointGenerator.create(`./${testBffPath}`, endpointPath);

    const router = await endpointGenerator.getRouter();
    if (!router) {
      await deleteFile(endpointPath);
      throw Error('router undefined');
    }

    expectRoute(router.stack[0], '/', 'get', 'this is the base route');

    await deleteFile(endpointPath);
  });

  test('no js handlers present, creates empty manifest', async () => {
    const uniqueSuffix = Date.now() + Math.random().toString(36).slice(2);
    const endpointPath = `${endpointBasePath}_${uniqueSuffix}.js`;
    const endpointGenerator = await EndpointGenerator.create(`./_no_files`, endpointPath);

    const router = await endpointGenerator.getRouter();

    expect(router).toBeUndefined();
    expect(errorMock).toHaveBeenCalledWith('No endpoints found to map for ./_no_files');
    expect(errorMock.mock.calls[1][0]).toContain(`No router found in ${endpointPath}:`);
  });
});

async function deleteFile (file: string) {
  await rm(file);
}

async function checkHandlerFunction<T> (fun: (req: Request, res: Response, next: NextFunction) => any, expected: T) {
  let body: T | undefined;

  const req = {} as Request;
  const res = {
    send: (data: any) => {
      body = data;
    }
  } as any;
  const next = {} as any;

  await fun(req, res, next);

  expect(body).toBeDefined();
  expect(body).toBe(expected);
}

async function expectRoute (layer: any, path: string, method: string, expectedBody: any) {
  const route = layer.route as IRoute;
  expect(route.path).toBe(path);
  expect(route.stack[0].method).toBe(method);
  await checkHandlerFunction(route.stack[0].handle, expectedBody);
}