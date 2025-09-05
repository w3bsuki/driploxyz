#!/usr/bin/env node

/**
 * Performance Testing Script for Driplo
 * Load testing and performance validation
 */

import { performance } from 'perf_hooks';

class PerformanceTester {
  constructor(baseUrl = 'http://localhost:5173') {
    this.baseUrl = baseUrl;
    this.results = [];
    this.errors = [];
  }

  /**
   * Run performance tests
   */
  async runTests() {
    console.log('🚀 Starting Performance Tests for Driplo...\n');

    // Test API endpoints
    await this.testAPIEndpoints();
    
    // Test database performance
    await this.testDatabasePerformance();
    
    // Test page load times
    await this.testPageLoadTimes();
    
    // Generate report
    this.generateReport();
  }

  /**
   * Test API endpoints
   */
  async testAPIEndpoints() {
    console.log('🔌 Testing API endpoints...');
    
    const endpoints = [
      { path: '/api/health', method: 'GET', expectedTime: 100 },
      { path: '/api/search', method: 'GET', expectedTime: 500 },
      { path: '/api/products', method: 'GET', expectedTime: 300 },
      { path: '/api/categories', method: 'GET', expectedTime: 200 }
    ];

    for (const endpoint of endpoints) {
      await this.testEndpoint(endpoint);
    }
  }

  /**
   * Test individual endpoint
   */
  async testEndpoint(endpoint) {
    const start = performance.now();
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const duration = performance.now() - start;
      const status = response.status;
      
      const result = {
        endpoint: endpoint.path,
        method: endpoint.method,
        duration: Math.round(duration),
        status,
        success: status >= 200 && status < 400,
        expectedTime: endpoint.expectedTime,
        performance: duration <= endpoint.expectedTime ? 'good' : 'slow'
      };
      
      this.results.push(result);
      
      if (result.success) {
        console.log(`   ✓ ${endpoint.method} ${endpoint.path} - ${result.duration}ms (${result.performance})`);
      } else {
        console.log(`   ❌ ${endpoint.method} ${endpoint.path} - ${result.duration}ms (HTTP ${status})`);
      }
      
    } catch (error) {
      const duration = performance.now() - start;
      this.errors.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        error: error.message,
        duration: Math.round(duration)
      });
      
      console.log(`   ❌ ${endpoint.method} ${endpoint.path} - Error: ${error.message}`);
    }
  }

  /**
   * Test database performance
   */
  async testDatabasePerformance() {
    console.log('\n🗄️ Testing database performance...');
    
    // Test database queries through API
    const dbTests = [
      { name: 'User profiles query', endpoint: '/api/profile', expectedTime: 200 },
      { name: 'Products query', endpoint: '/api/products', expectedTime: 300 },
      { name: 'Categories query', endpoint: '/api/categories', expectedTime: 150 }
    ];

    for (const test of dbTests) {
      const start = performance.now();
      
      try {
        const response = await fetch(`${this.baseUrl}${test.endpoint}`);
        const duration = performance.now() - start;
        
        const result = {
          test: test.name,
          duration: Math.round(duration),
          success: response.ok,
          expectedTime: test.expectedTime,
          performance: duration <= test.expectedTime ? 'good' : 'slow'
        };
        
        this.results.push(result);
        
        if (result.success) {
          console.log(`   ✓ ${test.name} - ${result.duration}ms (${result.performance})`);
        } else {
          console.log(`   ❌ ${test.name} - ${result.duration}ms (HTTP ${response.status})`);
        }
        
      } catch (error) {
        const duration = performance.now() - start;
        this.errors.push({
          test: test.name,
          error: error.message,
          duration: Math.round(duration)
        });
        
        console.log(`   ❌ ${test.name} - Error: ${error.message}`);
      }
    }
  }

  /**
   * Test page load times
   */
  async testPageLoadTimes() {
    console.log('\n📄 Testing page load times...');
    
    const pages = [
      { path: '/', name: 'Homepage', expectedTime: 2000 },
      { path: '/search', name: 'Search page', expectedTime: 1500 },
      { path: '/categories', name: 'Categories page', expectedTime: 1000 }
    ];

    for (const page of pages) {
      const start = performance.now();
      
      try {
        const response = await fetch(`${this.baseUrl}${page.path}`);
        const duration = performance.now() - start;
        
        const result = {
          page: page.name,
          path: page.path,
          duration: Math.round(duration),
          success: response.ok,
          expectedTime: page.expectedTime,
          performance: duration <= page.expectedTime ? 'good' : 'slow'
        };
        
        this.results.push(result);
        
        if (result.success) {
          console.log(`   ✓ ${page.name} - ${result.duration}ms (${result.performance})`);
        } else {
          console.log(`   ❌ ${page.name} - ${result.duration}ms (HTTP ${response.status})`);
        }
        
      } catch (error) {
        const duration = performance.now() - start;
        this.errors.push({
          page: page.name,
          path: page.path,
          error: error.message,
          duration: Math.round(duration)
        });
        
        console.log(`   ❌ ${page.name} - Error: ${error.message}`);
      }
    }
  }

  /**
   * Generate performance report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 PERFORMANCE TEST REPORT');
    console.log('='.repeat(60));

    const totalTests = this.results.length + this.errors.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = this.results.filter(r => !r.success).length + this.errors.length;
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Successful: ${successfulTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Success Rate: ${Math.round((successfulTests / totalTests) * 100)}%`);

    // Performance analysis
    const apiResults = this.results.filter(r => r.endpoint);
    const dbResults = this.results.filter(r => r.test);
    const pageResults = this.results.filter(r => r.page);

    if (apiResults.length > 0) {
      const avgAPITime = Math.round(apiResults.reduce((sum, r) => sum + r.duration, 0) / apiResults.length);
      const slowAPIs = apiResults.filter(r => r.performance === 'slow').length;
      
      console.log(`\n🔌 API PERFORMANCE:`);
      console.log(`   Average Response Time: ${avgAPITime}ms`);
      console.log(`   Slow APIs: ${slowAPIs}/${apiResults.length}`);
    }

    if (dbResults.length > 0) {
      const avgDBTime = Math.round(dbResults.reduce((sum, r) => sum + r.duration, 0) / dbResults.length);
      const slowDBQueries = dbResults.filter(r => r.performance === 'slow').length;
      
      console.log(`\n🗄️ DATABASE PERFORMANCE:`);
      console.log(`   Average Query Time: ${avgDBTime}ms`);
      console.log(`   Slow Queries: ${slowDBQueries}/${dbResults.length}`);
    }

    if (pageResults.length > 0) {
      const avgPageTime = Math.round(pageResults.reduce((sum, r) => sum + r.duration, 0) / pageResults.length);
      const slowPages = pageResults.filter(r => r.performance === 'slow').length;
      
      console.log(`\n📄 PAGE LOAD PERFORMANCE:`);
      console.log(`   Average Load Time: ${avgPageTime}ms`);
      console.log(`   Slow Pages: ${slowPages}/${pageResults.length}`);
    }

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    
    const slowResults = this.results.filter(r => r.performance === 'slow');
    if (slowResults.length > 0) {
      console.log(`   • Optimize ${slowResults.length} slow operations`);
      slowResults.forEach(result => {
        if (result.endpoint) {
          console.log(`     - ${result.method} ${result.endpoint} (${result.duration}ms)`);
        } else if (result.test) {
          console.log(`     - ${result.test} (${result.duration}ms)`);
        } else if (result.page) {
          console.log(`     - ${result.page} (${result.duration}ms)`);
        }
      });
    }

    if (this.errors.length > 0) {
      console.log(`   • Fix ${this.errors.length} failing tests`);
    }

    // Performance targets
    console.log(`\n🎯 PERFORMANCE TARGETS:`);
    console.log(`   API Response Time: < 500ms`);
    console.log(`   Database Queries: < 200ms`);
    console.log(`   Page Load Time: < 2s`);
    console.log(`   Success Rate: > 95%`);

    console.log('\n' + '='.repeat(60));
    
    if (failedTests === 0 && slowResults.length === 0) {
      console.log('🎉 PERFORMANCE TEST PASSED!');
      console.log('Your application meets all performance targets.');
    } else {
      console.log('⚠️ PERFORMANCE TEST NEEDS ATTENTION!');
      console.log('Please optimize slow operations and fix failing tests.');
    }

    console.log('='.repeat(60));
  }
}

// Run performance tests
const tester = new PerformanceTester();
tester.runTests().catch(console.error);
