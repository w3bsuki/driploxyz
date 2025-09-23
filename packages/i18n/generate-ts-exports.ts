#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read all message keys from en.json
const enMessages: Record<string, string> = JSON.parse(fs.readFileSync(path.join(__dirname, 'messages/en.json'), 'utf8'));
const keys = Object.keys(enMessages).sort();

// Generate TypeScript declarations for all message keys
function generateMessageDeclarations(messages: Record<string, string>, keys: string[]): string[] {
  const declarations: string[] = [];

  for (const key of keys) {
    const value = messages[key];

    // Check if the message has placeholders (contains {})
    const placeholderMatches = value.match(/\{(\w+)\}/g);

    if (placeholderMatches) {
      // Extract placeholder names
      const params = placeholderMatches.map(match => match.slice(1, -1));
      const uniqueParams = [...new Set(params)];

      // Generate interface for parameters
      const paramTypes = uniqueParams.map(param => `${param}: string`).join('; ');
      declarations.push(`export declare function ${key}(inputs: { ${paramTypes} }): string;`);
    } else {
      // Simple message without parameters
      declarations.push(`export declare function ${key}(): string;`);
    }
  }

  return declarations;
}

const messageDeclarations = generateMessageDeclarations(enMessages, keys);

const tsContent = `// Generated message function declarations
// This file provides TypeScript definitions for Paraglide-generated functions
// AUTO-GENERATED - DO NOT EDIT MANUALLY

${messageDeclarations.join('\n')}
`;

// Write the declarations to src/generated-messages.d.ts
fs.writeFileSync(path.join(__dirname, 'src/generated-messages.d.ts'), tsContent, 'utf8');
