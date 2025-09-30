import * as fs from 'fs';
import * as path from 'path';
import { Config, File, HttpMethod } from './types.js';
import { parse } from '@babel/parser';
import { generate } from '@babel/generator';
import * as t from '@babel/types';
import _traverse from '@babel/traverse';
const traverse =  typeof _traverse === 'function' ? _traverse : _traverse.default;

export type ControllerManifest = {
  endpoints: File[];
};

type ParseEndpointResult = {
  handler: string;
  config: Config;
}

export async function createManifest (dirPath: string) : Promise<ControllerManifest> {
  if (!fs.existsSync(dirPath)) return {
    endpoints: []
  }; 
  
  const entries = fs.readdirSync(dirPath);
  const mappedEntries: File[] = [];

  for (const entry of entries) { 
    mappedEntries.push(...await mapEntry(entry, dirPath));
  }

  return {
    endpoints: mappedEntries
  };
}

async function mapEntry (entry: string, currentPath: string, url: string = '') : Promise<File[]> {
  const fullPath = path.join(currentPath, entry);
  const stats = fs.statSync(fullPath);

  const files: File[] = [];
  url = url + `/${entry}`;

  if (stats.isDirectory()) {
    const subEntries = fs.readdirSync(fullPath);
    for (const e of subEntries) {
      files.push(...await mapEntry(e, fullPath, url));
    }
  } else {
    const endpointResult = parseEndpointFile(fullPath);
    
    if (endpointResult.handler) {
      files.push({
        name: entry,
        route: url.replace('index.js', '').replace('.js', ''),
        path: fullPath.replace(/\\/g, '/'),
        config: endpointResult.config,
        handler: endpointResult.handler
      });
    }
  }

  return files;
}

function parseEndpointFile (filePath: string): ParseEndpointResult {
  const content = fs.readFileSync(filePath, 'utf-8');
  let ast;
  try {
    ast = parse(content, { sourceType: 'module' });
  } catch (error) {
    console.error(`Failed to parse ${filePath}: ${error}`);
    return {
      handler: '',
      config: {
        httpMethod: HttpMethod.GET,
        middleware: [],
        handlerName: ''
      }
    };
  }

  let handlerNode: t.FunctionDeclaration | null = null;
  let configNode: t.ObjectExpression | null = null;

  traverse(ast, {
    ExportNamedDeclaration (path) {
      if (path.node.declaration?.type === 'FunctionDeclaration' &&
          path.node.declaration.id?.name === 'handler') {
        handlerNode = path.node.declaration;
      }
      if (path.node.declaration?.type === 'VariableDeclaration') {
        const decl = path.node.declaration.declarations[0];
        if (t.isIdentifier(decl.id) && decl.id.name === 'config') {
          configNode = decl.init as t.ObjectExpression;
        }
      }
    },
    ExportDefaultDeclaration (path) {
      if (path.node.declaration?.type === 'FunctionDeclaration' &&
          path.node.declaration.id?.name === 'handler') {
        handlerNode = path.node.declaration;
      }
    }
  });

  if (!handlerNode) throw new Error('No handler found');

  const safeHandlerNode = handlerNode as t.FunctionDeclaration;

  const functionName = getFunctionName(filePath);
  safeHandlerNode.id!.name = functionName;

  return {
    handler: generate(safeHandlerNode).code,
    config: parseConfig(configNode, functionName)
  };
}

function parseConfig (configNode: t.ObjectExpression | null, handlerName: string) : Config {
  if (configNode) {
    try {
      const cfg = eval('(' + generate(configNode).code + ')') as Partial<Config>;
      return {
        httpMethod: cfg.httpMethod ?? HttpMethod.GET,
        middleware: cfg.middleware ?? [],
        handlerName: handlerName
      };
    } catch (error) {
      console.error(`failed to evaluate config: ${error}`);
      return {
        httpMethod: HttpMethod.GET,
        middleware: [],
        handlerName: handlerName
      };
    }
  } else {
    return {
      httpMethod: HttpMethod.GET,
      middleware: [],
      handlerName: handlerName
    };
  }
}

function getFunctionName (filePath: string) : string {
  const parts = path
    .relative(process.cwd(), filePath) 
    .split(path.sep);                   

  const relevantParts = parts.slice(-2); 

  return relevantParts
    .join('_')                          
    .replace(/[^a-zA-Z0-9_$]/g, '_')    
    .replace(/^(\d)/, '_$1'); 
}