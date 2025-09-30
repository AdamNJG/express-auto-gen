import { describe, test, expect, afterAll } from 'vitest';
import { loadConfig } from '../src/configLoader/configLoader';
import * as fs from 'fs';
import * as path from 'path';
const baseConfigName = './autoapi.config';

afterAll(async () => {
  await deleteOldConfigs;
});

describe('configLoader tests',() => {
  test('load config', async () => {
    await copyConfig('./__tests__/configs/autoapi.config.ts', '.ts');
    const config = await loadConfig();

    expect(config).not.toBe(undefined);
  });

  /*const extensions: string[] = [
    '.ts', 
    '.cjs',
    '.mjs',
    '.json' 
  ];

  test.each(extensions)(`CLI run with missing config, creates default ($extension)`,
    async (item) => {
      await copyConfig('./__tests__/configs/autoapi.config.ts', item);
      const config = await loadConfig();

      expect(config).not.toBe(undefined);
    }, 10000);*/

});

async function deleteOldConfigs () {

  const extensions = ['.ts', '.js', '.json', '.cjs', '.mjs'];
  extensions.forEach((ex: string) => {
    const configPath = path.resolve(baseConfigName + ex);
    if (fs.existsSync(configPath)) {
      fs.rmSync(configPath);
    }
  });
}

async function copyConfig (source: string, extension: string) { 
  await deleteOldConfigs();

  const src = path.resolve(source);
  const dest = path.resolve(baseConfigName + extension);
  fs.copyFileSync(src, dest);
}
