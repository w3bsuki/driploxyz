#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories to search (relative to project root)
const searchDirectories = [
  path.join(__dirname, '../apps/web/src'),
  path.join(__dirname, '../packages/ui/src')
];

// Patterns to search for
const patterns = {
  effect: /\$effect\s*\(/g,
  effectRoot: /\$effect\.root\s*\(/g,
  effectTracked: /\$effect\.tracked\s*\(/g,
  reactiveStatement: /\$:\s+/g,
  exportLet: /export\s+let\s+/g,
  state: /\$state\s*\(/g,
  derived: /\$derived\s*\(/g,
  props: /\$props\s*\(/g
};

function findSvelteFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.svelte')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function searchInFiles(patterns, directories) {
  const results = {
    effects: [],
    reactiveStatements: [],
    exportLets: [],
    states: [],
    deriveds: [],
    props: []
  };

  directories.forEach(dir => {
    const files = findSvelteFiles(dir);
    
    files.forEach(filePath => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        // Check for $effect usage
        const effectMatches = content.match(patterns.effect);
        if (effectMatches) {
          results.effects.push({
            file: relativePath,
            count: effectMatches.length,
            matches: effectMatches
          });
        }

        // Check for $effect.root usage
        const effectRootMatches = content.match(patterns.effectRoot);
        if (effectRootMatches) {
          results.effects.push({
            file: relativePath,
            count: effectRootMatches.length,
            matches: effectRootMatches,
            type: 'effect.root'
          });
        }

        // Check for $effect.tracked usage
        const effectTrackedMatches = content.match(patterns.effectTracked);
        if (effectTrackedMatches) {
          results.effects.push({
            file: relativePath,
            count: effectTrackedMatches.length,
            matches: effectTrackedMatches,
            type: 'effect.tracked'
          });
        }
        
        // Check for reactive statements
        const reactiveMatches = content.match(patterns.reactiveStatement);
        if (reactiveMatches) {
          results.reactiveStatements.push({
            file: relativePath,
            count: reactiveMatches.length,
            matches: reactiveMatches
          });
        }
        
        // Check for export let
        const exportLetMatches = content.match(patterns.exportLet);
        if (exportLetMatches) {
          results.exportLets.push({
            file: relativePath,
            count: exportLetMatches.length,
            matches: exportLetMatches
          });
        }
        
        // Check for $state usage
        const stateMatches = content.match(patterns.state);
        if (stateMatches) {
          results.states.push({
            file: relativePath,
            count: stateMatches.length,
            matches: stateMatches
          });
        }
        
        // Check for $derived usage
        const derivedMatches = content.match(patterns.derived);
        if (derivedMatches) {
          results.deriveds.push({
            file: relativePath,
            count: derivedMatches.length,
            matches: derivedMatches
          });
        }
        
        // Check for $props usage
        const propsMatches = content.match(patterns.props);
        if (propsMatches) {
          results.props.push({
            file: relativePath,
            count: propsMatches.length,
            matches: propsMatches
          });
        }
      } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
      }
    });
  });

  return results;
}

function analyzeEffectOveruse(results) {
  const potentialIssues = [];
  
  results.effects.forEach(effect => {
    try {
      const content = fs.readFileSync(effect.file, 'utf8');
      const lines = content.split('\n');
      
      // Find line numbers for effects
      const effectLines = [];
      lines.forEach((line, index) => {
        if (line.includes('$effect(') || line.includes('$effect.root(') || line.includes('$effect.tracked(')) {
          effectLines.push(index + 1);
        }
      });
      
      // Check for complex logic in effects (more than 3 lines, multiple operations)
      effectLines.forEach(lineNum => {
        const startIdx = lineNum - 1;
        let effectEnd = startIdx;
        let braceCount = 0;
        let foundOpeningBrace = false;
        
        // Find the end of the effect block
        for (let i = startIdx; i < lines.length; i++) {
          const line = lines[i];
          for (const char of line) {
            if (char === '{') {
              braceCount++;
              foundOpeningBrace = true;
            } else if (char === '}') {
              braceCount--;
            }
          }
          
          if (foundOpeningBrace && braceCount === 0) {
            effectEnd = i;
            break;
          }
        }
        
        const effectLinesCount = effectEnd - startIdx + 1;
        
        // If effect is more than 5 lines, it might be too complex
        if (effectLinesCount > 5) {
          potentialIssues.push({
            file: effect.file,
            line: lineNum,
            issue: 'Complex effect (too many lines)',
            linesCount: effectLinesCount,
            suggestion: 'Consider using $derived instead'
          });
        }
        
        // Check for operations that should be derived values
        const effectContent = lines.slice(startIdx, effectEnd + 1).join('\n');
        if (effectContent.includes('return') && !effectContent.includes('sideEffect') && !effectContent.includes('addEventListener') && !effectContent.includes('removeEventListener')) {
          potentialIssues.push({
            file: effect.file,
            line: lineNum,
            issue: 'Effect with return value',
            suggestion: 'Consider using $derived instead of $effect'
          });
        }
      });
    } catch (error) {
      console.error(`Error analyzing effects in ${effect.file}:`, error.message);
    }
  });
  
  return potentialIssues;
}

function main() {
  console.log('🔍 Searching for Svelte 5 patterns and effect usage...\n');
  
  const results = searchInFiles(patterns, searchDirectories);
  const potentialIssues = analyzeEffectOveruse(results);
  
  // Print results
  console.log('=== RESULTS ===\n');
  
  console.log(`📊 $effect Usage: ${results.effects.length} files`);
  results.effects.forEach(effect => {
    console.log(`  ${effect.file} (${effect.count} instances)`);
    if (effect.type) console.log(`    Type: ${effect.type}`);
  });
  
  console.log(`\n📊 Reactive Statements ($:): ${results.reactiveStatements.length} files`);
  results.reactiveStatements.forEach(stmt => {
    console.log(`  ${stmt.file} (${stmt.count} instances)`);
  });
  
  console.log(`\n📊 Export Let: ${results.exportLets.length} files`);
  results.exportLets.forEach(exp => {
    console.log(`  ${exp.file} (${exp.count} instances)`);
  });
  
  console.log(`\n📊 $state Usage: ${results.states.length} files`);
  results.states.forEach(state => {
    console.log(`  ${state.file} (${state.count} instances)`);
  });
  
  console.log(`\n📊 $derived Usage: ${results.deriveds.length} files`);
  results.deriveds.forEach(derived => {
    console.log(`  ${derived.file} (${derived.count} instances)`);
  });
  
  console.log(`\n📊 $props Usage: ${results.props.length} files`);
  results.props.forEach(props => {
    console.log(`  ${props.file} (${props.count} instances)`);
  });
  
  if (potentialIssues.length > 0) {
    console.log('\n⚠️  Potential Effect Overuse Issues:');
    potentialIssues.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line} - ${issue.issue}`);
      console.log(`    Suggestion: ${issue.suggestion}`);
    });
  }
  
  // Generate JSON report
  const report = {
    summary: {
      effectsFiles: results.effects.length,
      reactiveStatementsFiles: results.reactiveStatements.length,
      exportLetsFiles: results.exportLets.length,
      statesFiles: results.states.length,
      derivedsFiles: results.deriveds.length,
      propsFiles: results.props.length,
      potentialIssues: potentialIssues.length
    },
    details: results,
    issues: potentialIssues
  };
  
  fs.writeFileSync('effect-usage-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to effect-usage-report.json');
}

main();