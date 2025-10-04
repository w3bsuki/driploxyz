/**
 * Security audit utilities for third-party dependencies
 */

// Vulnerability severity levels
export enum Severity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Vulnerability interface
export interface Vulnerability {
  id: string;
  packageName: string;
  severity: Severity;
  title: string;
  description: string;
  url: string;
  version: string;
  fixedIn?: string;
}

// Security audit result
export interface SecurityAuditResult {
  vulnerabilities: Vulnerability[];
  totalVulnerabilities: number;
  vulnerabilitiesBySeverity: Record<Severity, number>;
  lastUpdated: Date;
}

// Known vulnerable packages and their fixed versions
const knownVulnerabilities: Record<string, Vulnerability[]> = {
  // Add known vulnerabilities as needed
  // This would be updated regularly from a security database
};

/**
 * Check if a package has known vulnerabilities
 */
export function checkPackageVulnerabilities(packageName: string, _version: string): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];
  
  // Check against known vulnerabilities
  if (knownVulnerabilities[packageName]) {
    vulnerabilities.push(...knownVulnerabilities[packageName]);
  }
  
  // In a real implementation, you would query a vulnerability database like:
  // - OSV (Open Source Vulnerability database)
  // - Snyk vulnerability database
  // - GitHub Advisory Database
  // - npm audit
  
  return vulnerabilities;
}

/**
 * Run a security audit on all dependencies
 */
export async function runSecurityAudit(): Promise<SecurityAuditResult> {
  try {
    // In a real implementation, you would:
    // 1. Get list of all dependencies from package.json
    // 2. Query vulnerability database for each package
    // 3. Aggregate results
    
    // For now, we'll return a mock result
    const vulnerabilities: Vulnerability[] = [];
    
    // Add mock vulnerabilities for demonstration
    vulnerabilities.push({
      id: 'GHSA-1234-5678',
      packageName: 'example-package',
      severity: Severity.MODERATE,
      title: 'Example vulnerability',
      description: 'This is an example vulnerability for demonstration purposes.',
      url: 'https://example.com/vulnerability',
      version: '1.0.0',
      fixedIn: '1.0.1'
    });
    
    const vulnerabilitiesBySeverity: Record<Severity, number> = {
      [Severity.LOW]: 0,
      [Severity.MODERATE]: 0,
      [Severity.HIGH]: 0,
      [Severity.CRITICAL]: 0
    };
    
    vulnerabilities.forEach(vuln => {
      vulnerabilitiesBySeverity[vuln.severity]++;
    });
    
    return {
      vulnerabilities,
      totalVulnerabilities: vulnerabilities.length,
      vulnerabilitiesBySeverity,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Security audit error:', error);
    
    return {
      vulnerabilities: [],
      totalVulnerabilities: 0,
      vulnerabilitiesBySeverity: {
        [Severity.LOW]: 0,
        [Severity.MODERATE]: 0,
        [Severity.HIGH]: 0,
        [Severity.CRITICAL]: 0
      },
      lastUpdated: new Date()
    };
  }
}

/**
 * Check if a package is safe to use based on security audit
 */
export function isPackageSafe(packageName: string, version: string, auditResult: SecurityAuditResult): boolean {
  const vulnerabilities = auditResult.vulnerabilities.filter(
    vuln => vuln.packageName === packageName && 
    (!vuln.fixedIn || compareVersions(version, vuln.fixedIn) < 0)
  );
  
  // Consider a package unsafe if it has any high or critical vulnerabilities
  const hasHighSeverityVulns = vulnerabilities.some(
    vuln => vuln.severity === Severity.HIGH || vuln.severity === Severity.CRITICAL
  );
  
  return !hasHighSeverityVulns;
}

/**
 * Compare two version strings
 * Returns -1 if version1 < version2, 0 if equal, 1 if version1 > version2
 */
function compareVersions(version1: string, version2: string): number {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  const maxLength = Math.max(v1parts.length, v2parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part < v2part) return -1;
    if (v1part > v2part) return 1;
  }
  
  return 0;
}

/**
 * Generate a security report
 */
export function generateSecurityReport(auditResult: SecurityAuditResult): string {
  let report = '# Security Audit Report\n\n';
  report += `**Last Updated:** ${auditResult.lastUpdated.toISOString()}\n\n`;
  
  if (auditResult.totalVulnerabilities === 0) {
    report += '✅ **No vulnerabilities found.**\n\n';
  } else {
    report += `## Summary\n\n`;
    report += `- **Total Vulnerabilities:** ${auditResult.totalVulnerabilities}\n`;
    report += `- **Critical:** ${auditResult.vulnerabilitiesBySeverity[Severity.CRITICAL]}\n`;
    report += `- **High:** ${auditResult.vulnerabilitiesBySeverity[Severity.HIGH]}\n`;
    report += `- **Moderate:** ${auditResult.vulnerabilitiesBySeverity[Severity.MODERATE]}\n`;
    report += `- **Low:** ${auditResult.vulnerabilitiesBySeverity[Severity.LOW]}\n\n`;
    
    // Group vulnerabilities by severity
    const criticalVulns = auditResult.vulnerabilities.filter(v => v.severity === Severity.CRITICAL);
    const highVulns = auditResult.vulnerabilities.filter(v => v.severity === Severity.HIGH);
    const moderateVulns = auditResult.vulnerabilities.filter(v => v.severity === Severity.MODERATE);
    const lowVulns = auditResult.vulnerabilities.filter(v => v.severity === Severity.LOW);
    
    if (criticalVulns.length > 0) {
      report += '## 🔴 Critical Vulnerabilities\n\n';
      criticalVulns.forEach(vuln => {
        report += `### ${vuln.packageName} (${vuln.version})\n`;
        report += `- **Title:** ${vuln.title}\n`;
        report += `- **Description:** ${vuln.description}\n`;
        report += `- **Fixed in:** ${vuln.fixedIn || 'Not fixed'}\n`;
        report += `- **URL:** [${vuln.id}](${vuln.url})\n\n`;
      });
    }
    
    if (highVulns.length > 0) {
      report += '## 🟠 High Vulnerabilities\n\n';
      highVulns.forEach(vuln => {
        report += `### ${vuln.packageName} (${vuln.version})\n`;
        report += `- **Title:** ${vuln.title}\n`;
        report += `- **Description:** ${vuln.description}\n`;
        report += `- **Fixed in:** ${vuln.fixedIn || 'Not fixed'}\n`;
        report += `- **URL:** [${vuln.id}](${vuln.url})\n\n`;
      });
    }
    
    if (moderateVulns.length > 0) {
      report += '## 🟡 Moderate Vulnerabilities\n\n';
      moderateVulns.forEach(vuln => {
        report += `### ${vuln.packageName} (${vuln.version})\n`;
        report += `- **Title:** ${vuln.title}\n`;
        report += `- **Description:** ${vuln.description}\n`;
        report += `- **Fixed in:** ${vuln.fixedIn || 'Not fixed'}\n`;
        report += `- **URL:** [${vuln.id}](${vuln.url})\n\n`;
      });
    }
    
    if (lowVulns.length > 0) {
      report += '## 🟢 Low Vulnerabilities\n\n';
      lowVulns.forEach(vuln => {
        report += `### ${vuln.packageName} (${vuln.version})\n`;
        report += `- **Title:** ${vuln.title}\n`;
        report += `- **Description:** ${vuln.description}\n`;
        report += `- **Fixed in:** ${vuln.fixedIn || 'Not fixed'}\n`;
        report += `- **URL:** [${vuln.id}](${vuln.url})\n\n`;
      });
    }
  }
  
  report += '## Recommendations\n\n';
  report += '1. Update all packages with vulnerabilities to their latest fixed versions.\n';
  report += '2. Regularly run security audits to catch new vulnerabilities.\n';
  report += '3. Consider using automated security scanning tools in your CI/CD pipeline.\n';
  report += '4. Subscribe to security advisories for your dependencies.\n';
  
  return report;
}

/**
 * Check for security best practices in package.json
 */
export function checkPackageSecurityBestPractices(packageJson: unknown): {
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check for scripts that could be security risks
  if (packageJson && typeof packageJson === 'object' && 'scripts' in packageJson) {
    const scripts = packageJson.scripts as Record<string, unknown>;
    
    if (scripts.postinstall) {
      issues.push('postinstall script detected - this can be a security risk');
      recommendations.push('Remove postinstall script unless absolutely necessary');
    }
    
    if (scripts.preinstall) {
      issues.push('preinstall script detected - this can be a security risk');
      recommendations.push('Remove preinstall script unless absolutely necessary');
    }
  }
  
  // Check for dependencies with known security issues
  if (packageJson && typeof packageJson === 'object' && 'dependencies' in packageJson) {
    const dependencies = packageJson.dependencies as Record<string, unknown>;
    const riskyPackages = ['eval', 'function-bind', 'shelljs', 'underscore'];
    
    riskyPackages.forEach(pkg => {
      if (dependencies[pkg]) {
        issues.push(`Dependency on potentially risky package: ${pkg}`);
        recommendations.push(`Consider replacing ${pkg} with a safer alternative`);
      }
    });
  }
  
  // Check for outdated packages
  if (packageJson && typeof packageJson === 'object' && 'engines' in packageJson) {
    const engines = packageJson.engines as Record<string, unknown>;
    
    if (engines.node && typeof engines.node === 'string') {
      const nodeVersion = engines.node;
      if (nodeVersion.includes('14') || nodeVersion.includes('16')) {
        issues.push(`Using outdated Node.js version: ${nodeVersion}`);
        recommendations.push('Update to a supported Node.js version (18 or 20)');
      }
    }
  }
  
  return { issues, recommendations };
}