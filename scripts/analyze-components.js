#!/usr/bin/env node

// Phase 4C Component Analysis Script - Node.js Version
// Analyzes component usage across apps/web/src to determine shared vs route-specific components

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = 'K:\\driplo-turbo-1\\apps\\web\\src\\lib\\components';
const SEARCH_DIR = 'K:\\driplo-turbo-1\\apps\\web\\src';
const OUTPUT_FILE = 'K:\\driplo-turbo-1\\phase4c-component-map.json';

console.log('Phase 4C Component Analysis Starting...');
console.log(`Components Directory: ${COMPONENTS_DIR}`);
console.log(`Search Directory: ${SEARCH_DIR}`);
console.log(`Output File: ${OUTPUT_FILE}`);

// Helper function to get all files recursively
function getAllFiles(dir, extensions = ['.svelte', '.ts', '.js']) {
    const files = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...getAllFiles(fullPath, extensions));
        } else if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
        }
    }

    return files;
}

// Helper function to get relative path from base directory
function getRelativePath(fullPath, baseDir) {
    return fullPath.replace(baseDir + path.sep, '').replace(/\\/g, '/');
}

// Helper function to extract component name from file path
function getComponentName(filePath) {
    return path.basename(filePath, '.svelte');
}

// Helper function to find component usage in a file
function findComponentUsageInFile(filePath, componentPath) {
    if (!fs.existsSync(filePath)) {
        return { hasImport: false, usedInTemplate: false, importName: null };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const componentName = getComponentName(componentPath);

    // Look for import statements
    const importPatterns = [
        new RegExp(`import\\s+${componentName}\\s+from\\s+['"].*components/${componentPath.replace(/\\/g, '/')}['"]`, 'i'),
        new RegExp(`import\\s+\\{\\s*${componentName}\\s*\\}\\s+from\\s+['"].*components/${componentPath.replace(/\\/g, '/')}['"]`, 'i'),
        new RegExp(`import\\s+\\{\\s*${componentName}\\s+as\\s+\\w+\\s*\\}\\s+from\\s+['"].*components/${componentPath.replace(/\\/g, '/')}['"]`, 'i'),
        new RegExp(`import\\s+${componentName}\\s+as\\s+\\w+\\s+from\\s+['"].*components/${componentPath.replace(/\\/g, '/')}['"]`, 'i'),
        new RegExp(`import\\s+from\\s+['"].*components/${componentPath.replace(/\\/g, '/')}['"]`, 'i')
    ];

    let hasImport = false;
    let importName = componentName;

    for (const pattern of importPatterns) {
        const match = content.match(pattern);
        if (match) {
            hasImport = true;

            // Try to extract the actual import name from the matched line
            const lines = content.split('\n');
            for (const line of lines) {
                if (line.match(pattern)) {
                    const nameMatch = line.match(/import\s+\{?\s*(\w+)/);
                    if (nameMatch) {
                        importName = nameMatch[1];
                    }
                    break;
                }
            }
            break;
        }
    }

    // Look for component usage in template
    const usagePattern = new RegExp(`<\\s*${importName}(?:\\s|>|\\/>)`, 'i');
    const usedInTemplate = usagePattern.test(content);

    return { hasImport, usedInTemplate, importName };
}

// Get all component files
const componentFiles = getAllFiles(COMPONENTS_DIR, ['.svelte'])
    .map(filePath => ({
        name: getComponentName(filePath),
        path: getRelativePath(filePath, COMPONENTS_DIR),
        fullPath: filePath
    }));

console.log(`Found ${componentFiles.length} components to analyze`);

// Get all source files (excluding components directory)
const sourceFiles = getAllFiles(SEARCH_DIR)
    .filter(filePath => !filePath.includes('\\components\\') && !filePath.includes('/components/'));

const results = [];

// Analyze each component
for (const component of componentFiles) {
    console.log(`Analyzing ${component.name}...`);

    const usage = {
        usedBy: [],
        usageCount: 0,
        routes: []
    };

    // Check each source file for component usage
    for (const sourceFile of sourceFiles) {
        const fileUsage = findComponentUsageInFile(sourceFile, component.path);

        if (fileUsage.hasImport && fileUsage.usedInTemplate) {
            const relativePath = getRelativePath(sourceFile, SEARCH_DIR);
            usage.usedBy.push(relativePath);
            usage.usageCount++;

            // Extract route path
            let routePath = relativePath;
            if (relativePath.includes('routes\\') || relativePath.includes('routes/')) {
                const routeMatch = relativePath.match(/routes[\\/](.+)/);
                if (routeMatch) {
                    routePath = routeMatch[1].replace(/\\/g, '/');
                }
            }

            if (!usage.routes.includes(routePath)) {
                usage.routes.push(routePath);
            }
        }
    }

    // Determine action based on usage
    let action = 'KEEP in lib';
    let targetRoute = '';

    if (usage.usageCount === 0) {
        action = 'UNUSED - review for removal';
    } else if (usage.usageCount === 1 && usage.routes.length === 1) {
        action = 'MOVE to route';
        targetRoute = usage.routes[0];
    }

    // Special handling for known route-specific patterns
    if (component.path.includes('modular/') ||
        component.path.startsWith('Message') ||
        component.path.startsWith('Conversation')) {
        if (usage.routes.length === 1 && usage.routes[0].includes('messages')) {
            action = 'MOVE to route';
            targetRoute = usage.routes[0];
        }
    }

    if (component.name === 'VirtualProductGrid' && usage.routes.length === 1) {
        action = 'MOVE to route';
        targetRoute = usage.routes[0];
    }

    const result = {
        Path: component.path,
        UsageCount: usage.usageCount,
        Action: action,
        TargetRoute: targetRoute,
        UsedBy: usage.usedBy,
        Routes: usage.routes
    };

    results.push(result);

    console.log(`  Usage Count: ${usage.usageCount}`);
    console.log(`  Action: ${action}`);
    if (targetRoute) {
        console.log(`  Target Route: ${targetRoute}`);
    }
}

// Sort results by path
results.sort((a, b) => a.Path.localeCompare(b.Path));

// Write results to JSON file
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

console.log('\nAnalysis complete!');
console.log(`Results saved to: ${OUTPUT_FILE}`);

// Summary statistics
const sharedCount = results.filter(r => r.Action === 'KEEP in lib').length;
const moveCount = results.filter(r => r.Action === 'MOVE to route').length;
const unusedCount = results.filter(r => r.Action.includes('UNUSED')).length;

console.log('\nSummary:');
console.log(`  Shared components (KEEP): ${sharedCount}`);
console.log(`  Route-specific components (MOVE): ${moveCount}`);
console.log(`  Unused components: ${unusedCount}`);

// Show components to move
const moveComponents = results.filter(r => r.Action === 'MOVE to route');
if (moveComponents.length > 0) {
    console.log('\nComponents to move to routes:');
    moveComponents.forEach(comp => {
        console.log(`  ${comp.Path} → ${comp.TargetRoute}`);
    });
}

// Show unused components
const unusedComponents = results.filter(r => r.Action.includes('UNUSED'));
if (unusedComponents.length > 0) {
    console.log('\nUnused components (review for removal):');
    unusedComponents.forEach(comp => {
        console.log(`  ${comp.Path}`);
    });
}

console.log('\nPhase 4C Component Analysis Complete!');