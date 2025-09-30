import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';
import { createManifest } from '../src/endpointGenerator/manifestGenerator';
import { File, HttpMethod } from '../src/endpointGenerator/types';

describe('Manifest Generator', () => {
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
  test('create manifest using config', async () => {
    const manifest = await createManifest('./__tests__/test_bff_config');

    expect(manifest.endpoints).toStrictEqual(bff_test_endpoints);
  });

  test('create manifest', async () => {
    const manifest = await createManifest('./__tests__/test_bff_invalid_config');

    expect(manifest.endpoints).toStrictEqual(bff_invalid_config_endpoints);
    expect(errorMock.mock.calls[0][0]).toContain(`Failed to parse `);
  });
});

const bff_test_endpoints: File[] = [                                                                                                                
  {                                                                                                              
    name: 'index.js',                                                                                            
    route: '/',                                                                                                  
    path: '__tests__/test_bff_config/index.js',    
    handler: 'async function test_bff_config_index_js(req, res) {\n' +
      '  await res.send("this is the base route");\n' +
      '}',                                                                     
    config: {
      httpMethod: HttpMethod.POST,
      middleware: [],
      handlerName: 'test_bff_config_index_js'
    }                                                                                           
  },                                                                                                             
  {
    name: 'index.js',
    route: '/test/',
    path: '__tests__/test_bff_config/test/index.js',
    handler: 'function test_index_js(req, res) {\n  res.send("this is /test/");\n}',                                                                     
    config: {
      httpMethod: HttpMethod.PUT,
      middleware: [],
      handlerName: 'test_index_js'
    }            
  },
  {
    name: 'test.js',
    route: '/test/test',
    path: '__tests__/test_bff_config/test/test.js',
    handler: 'function test_test_js(req, res) {\n  res.send("this is /test/test");\n}',                                                                     
    config: {
      httpMethod: HttpMethod.PATCH,
      middleware: [],
      handlerName: 'test_test_js'
    }            
  }
];

const bff_invalid_config_endpoints: File[] = [
  {
    name: 'index.js',
    path: '__tests__/test_bff_invalid_config/index.js',
    route: '/',
    handler: 'async function test_bff_invalid_config_index_js(req, res) {\n' +
      '  await res.send("this is the base route");\n' +
      '}',
    config: {
      httpMethod: HttpMethod.GET,
      middleware: [],
      handlerName: 'test_bff_invalid_config_index_js'
    }
  }
];