import * as path from 'path';
import * as fs from 'fs';
import { AutoApiConfig } from './config.js';
import { Module } from 'module';
import ts from 'typescript';
import vm from 'vm';

export async function loadConfig (): Promise<AutoApiConfig | undefined> {
  const candidates = ['ts', 'js', 'json', 'cjs', 'mjs'];
  const projectRoot = process.cwd();

  for (const extension of candidates) {

    const filePath = path.join(projectRoot, 'autoapi.config.' + extension);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();

      switch (ext) {
      case '.json':
      {
        const json = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(json) as AutoApiConfig;
      }
      case '.js':
      case '.cjs':
      case '.mjs':
        return (await import(filePath)).default as AutoApiConfig;
      case '.ts':
        return importTsConfig(filePath) as AutoApiConfig;
      default:
        return undefined;
      }
    }
  }
}

function importTsConfig (file: string) {
  const tsCode = fs.readFileSync(file, 'utf8');

  const jsCode = ts.transpileModule(tsCode, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true
    },
    fileName: path.basename(file)
  }).outputText;

  return loadTsModuleCjs(jsCode, file) as AutoApiConfig;
}

function loadTsModuleCjs (jsCode: string, filename: string) : AutoApiConfig {
  const m = { exports: {} };
  const wrapper = Module.wrap(jsCode); // Wraps code in function(exports, require, module, __filename, __dirname)
  const script = new vm.Script(wrapper, { filename });
  const func = script.runInThisContext();
  func(m.exports, require, m, filename, path.dirname(filename));
  const exported = m.exports as any;
  return (exported.default ?? exported) as AutoApiConfig;
}