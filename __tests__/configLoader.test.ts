import { describe, test, expect } from 'vitest';
import { loadConfig } from '../src/configLoader/configLoader';

describe('configLoader tests',() => {
  test('load config', async () => {
    const config = await loadConfig();

    expect(config).not.toBe(undefined);
  });
});