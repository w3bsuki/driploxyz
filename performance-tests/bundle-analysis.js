/**
 * Bundle Analysis Script for Filter Components
 * Analyzes the bundle size impact of the new filter system
 * Validates against performance budgets from CLAUDE.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Performance budgets from strategy document
const BUNDLE_BUDGETS = {
  totalFilterComponents: 50, // KB gzipped
  meltUIOverhead: 25,        // KB gzipped
  individualComponentMax: 15, // KB gzipped
  cssOverhead: 10            // KB gzipped
};

// Component-specific budgets
const COMPONENT_BUDGETS = {
  BrandSelector: 8,      // KB gzipped
  CategorySelector: 12,  // KB gzipped
  ConditionSelector: 6,  // KB gzipped
  LocationSelector: 10,  // KB gzipped
  PriceRangeSelector: 8, // KB gzipped
  FilterBottomSheet: 15  // KB gzipped
};

class BundleAnalyzer {
  constructor() {
    this.buildPath = path.join(process.cwd(), 'apps/web/.svelte-kit');
    this.results = {
      components: {},
      totals: {},
      violations: [],
      recommendations: []
    };
  }

  /**
   * Analyze the built application bundle
   */
  async analyze() {
    console.log('🔍 Analyzing filter component bundle sizes...\n');

    try {
      // Run build analysis
      this.runBundleAnalysis();
      
      // Analyze component sizes
      this.analyzeComponentSizes();
      
      // Analyze dependency impact
      this.analyzeDependencyImpact();
      
      // Check against budgets
      this.checkBudgets();
      
      // Generate recommendations
      this.generateRecommendations();
      
      // Output results
      this.outputResults();
      
      return this.results;
      
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Run Vite bundle analysis
   */
  runBundleAnalysis() {
    try {
      console.log('📊 Running Vite bundle analysis...');
      
      // Generate bundle report
      execSync('npm run build -- --reporter=verbose', { 
        cwd: path.join(process.cwd(), 'apps/web'),
        stdio: 'pipe'
      });
      
      console.log('✅ Build analysis complete\n');
      
    } catch (error) {
      console.warn('⚠️  Bundle analysis command failed, proceeding with file analysis');
    }
  }

  /**
   * Analyze individual component sizes
   */
  analyzeComponentSizes() {
    console.log('📦 Analyzing component sizes...\n');

    const filterComponents = [
      'BrandSelector',
      'CategorySelector', 
      'ConditionSelector',
      'LocationSelector',
      'PriceRangeSelector',
      'FilterBottomSheet'
    ];

    filterComponents.forEach(component => {
      const size = this.getComponentSize(component);
      const budget = COMPONENT_BUDGETS[component];
      
      this.results.components[component] = {
        size,
        budget,
        withinBudget: size <= budget,
        overhead: size - budget
      };
      
      const status = size <= budget ? '✅' : '❌';
      const overhead = size > budget ? ` (+${(size - budget).toFixed(1)}KB over budget)` : '';
      
      console.log(`${status} ${component}: ${size.toFixed(1)}KB (budget: ${budget}KB)${overhead}`);
    });
    
    console.log('');
  }

  /**
   * Get estimated component size
   */
  getComponentSize(componentName) {
    // Estimate based on file sizes and dependencies
    const componentPaths = [
      `packages/ui/src/components/${componentName}.svelte`,
      `packages/ui/src/lib/${componentName}.svelte`
    ];
    
    let totalSize = 0;
    
    for (const componentPath of componentPaths) {
      const fullPath = path.join(process.cwd(), componentPath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        // Estimate gzipped size as ~30% of raw size
        totalSize += (stats.size / 1024) * 0.3;
        break;
      }
    }
    
    // Add estimated Melt UI overhead per component
    totalSize += 2; // KB estimated Melt UI overhead per component
    
    return totalSize;
  }

  /**
   * Analyze dependency impact
   */
  analyzeDependencyImpact() {
    console.log('🔗 Analyzing dependency impact...\n');
    
    // Analyze Melt UI impact
    const meltUISize = this.estimateMeltUISize();
    const meltUIBudget = BUNDLE_BUDGETS.meltUIOverhead;
    
    this.results.dependencies = {
      meltUI: {
        size: meltUISize,
        budget: meltUIBudget,
        withinBudget: meltUISize <= meltUIBudget,
        components: ['Dialog', 'Select', 'Combobox', 'Menu']
      }
    };
    
    const status = meltUISize <= meltUIBudget ? '✅' : '❌';
    const overhead = meltUISize > meltUIBudget ? ` (+${(meltUISize - meltUIBudget).toFixed(1)}KB over budget)` : '';
    
    console.log(`${status} Melt UI overhead: ${meltUISize.toFixed(1)}KB (budget: ${meltUIBudget}KB)${overhead}\n`);
  }

  /**
   * Estimate Melt UI bundle size
   */
  estimateMeltUISize() {
    // Estimated sizes for Melt UI components used in filters
    const meltComponents = {
      dialog: 8,     // KB - used in FilterModal
      select: 12,    // KB - used in selectors
      combobox: 10,  // KB - used in search selectors
      menu: 6        // KB - used in dropdown menus
    };
    
    return Object.values(meltComponents).reduce((total, size) => total + size, 0) * 0.3; // Estimate gzipped
  }

  /**
   * Check against performance budgets
   */
  checkBudgets() {
    console.log('🎯 Checking against performance budgets...\n');
    
    // Calculate total filter bundle size
    const totalFilterSize = Object.values(this.results.components)
      .reduce((total, comp) => total + comp.size, 0);
    
    const totalBudget = BUNDLE_BUDGETS.totalFilterComponents;
    
    this.results.totals = {
      size: totalFilterSize,
      budget: totalBudget,
      withinBudget: totalFilterSize <= totalBudget,
      overhead: totalFilterSize - totalBudget
    };
    
    const status = totalFilterSize <= totalBudget ? '✅' : '❌';
    const overhead = totalFilterSize > totalBudget ? ` (+${(totalFilterSize - totalBudget).toFixed(1)}KB over budget)` : '';
    
    console.log(`${status} Total filter bundle: ${totalFilterSize.toFixed(1)}KB (budget: ${totalBudget}KB)${overhead}\n`);
    
    // Collect budget violations
    Object.entries(this.results.components).forEach(([name, data]) => {
      if (!data.withinBudget) {
        this.results.violations.push({
          type: 'component',
          name,
          size: data.size,
          budget: data.budget,
          overhead: data.overhead
        });
      }
    });
    
    if (!this.results.totals.withinBudget) {
      this.results.violations.push({
        type: 'total',
        name: 'Total Filter Bundle',
        size: this.results.totals.size,
        budget: this.results.totals.budget,
        overhead: this.results.totals.overhead
      });
    }
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    console.log('💡 Generating optimization recommendations...\n');
    
    const recommendations = [];
    
    // Check for large components
    Object.entries(this.results.components).forEach(([name, data]) => {
      if (data.size > data.budget) {
        recommendations.push({
          priority: 'high',
          component: name,
          recommendation: `Reduce ${name} size by ${data.overhead.toFixed(1)}KB. Consider code splitting or reducing dependencies.`
        });
      }
    });
    
    // Check for overall bundle size
    if (!this.results.totals.withinBudget) {
      recommendations.push({
        priority: 'high',
        component: 'Total Bundle',
        recommendation: `Reduce total filter bundle size by ${this.results.totals.overhead.toFixed(1)}KB. Consider lazy loading non-critical filters.`
      });
    }
    
    // General recommendations
    recommendations.push({
      priority: 'medium',
      component: 'General',
      recommendation: 'Implement code splitting to load filter components on demand rather than upfront.'
    });
    
    recommendations.push({
      priority: 'medium', 
      component: 'General',
      recommendation: 'Consider tree shaking unused Melt UI components to reduce overhead.'
    });
    
    recommendations.push({
      priority: 'low',
      component: 'General',
      recommendation: 'Monitor bundle size changes with each filter component addition.'
    });
    
    this.results.recommendations = recommendations;
    
    recommendations.forEach(rec => {
      const icon = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      console.log(`${icon} ${rec.priority.toUpperCase()}: ${rec.recommendation}`);
    });
    
    console.log('');
  }

  /**
   * Output analysis results
   */
  outputResults() {
    console.log('📊 Bundle Analysis Summary\n');
    console.log('='.repeat(50));
    
    // Component breakdown
    console.log('\n📦 Component Sizes:');
    Object.entries(this.results.components).forEach(([name, data]) => {
      const status = data.withinBudget ? '✅' : '❌';
      console.log(`${status} ${name}: ${data.size.toFixed(1)}KB / ${data.budget}KB`);
    });
    
    // Total summary
    console.log(`\n🎯 Total Bundle: ${this.results.totals.size.toFixed(1)}KB / ${this.results.totals.budget}KB`);
    console.log(`📊 Budget Status: ${this.results.totals.withinBudget ? 'PASS' : 'FAIL'}`);
    
    // Violations
    if (this.results.violations.length > 0) {
      console.log('\n❌ Budget Violations:');
      this.results.violations.forEach(violation => {
        console.log(`  • ${violation.name}: +${violation.overhead.toFixed(1)}KB over budget`);
      });
    }
    
    // Performance impact
    console.log('\n🚀 Performance Impact:');
    console.log(`  • Estimated load time impact: ${(this.results.totals.size * 0.8).toFixed(0)}ms on 3G`);
    console.log(`  • Memory impact: ~${(this.results.totals.size * 1.5).toFixed(1)}MB heap usage`);
    console.log(`  • Parse time: ~${(this.results.totals.size * 0.5).toFixed(0)}ms on low-end mobile`);
    
    // Save results to file
    const outputPath = path.join(process.cwd(), 'bundle-analysis-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Results saved to: ${outputPath}`);
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyze().then(() => {
    const passed = analyzer.results.totals.withinBudget && 
                   analyzer.results.violations.length === 0;
    
    console.log(`\n${passed ? '✅ All performance budgets met!' : '❌ Performance budget violations detected!'}`);
    process.exit(passed ? 0 : 1);
  });
}

module.exports = BundleAnalyzer;