/* eslint-disable no-undef */
/**
 * Custom Node.js ESM loader that resolves extensionless imports by appending .js
 * This bridges the gap between Vite's module resolution and Node's strict ESM.
 */
import { existsSync } from 'node:fs';
import { resolve as pathResolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  // Only handle relative imports
  if (specifier.startsWith('.') && !specifier.endsWith('.js') && !specifier.endsWith('.jsx') && !specifier.endsWith('.json')) {
    const parentPath = context.parentURL ? fileURLToPath(context.parentURL) : process.cwd();
    const parentDir = parentPath.endsWith('.js') || parentPath.endsWith('.jsx')
      ? pathResolve(parentPath, '..')
      : parentPath;

    // Try appending .js
    const withJs = pathResolve(parentDir, specifier + '.js');
    if (existsSync(withJs)) {
      return nextResolve(specifier + '.js', context);
    }

    // Try appending /index.js (directory import)
    const indexJs = pathResolve(parentDir, specifier, 'index.js');
    if (existsSync(indexJs)) {
      return nextResolve(specifier + '/index.js', context);
    }
  }

  return nextResolve(specifier, context);
}
