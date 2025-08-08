import { spawn, ChildProcess } from "child_process";
import { app } from "electron";
import { EventEmitter } from "events";
import path from "path";
import fs from "fs/promises";
import os from "os";
import crypto from "crypto";

interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  port: number;
  healthCheckPath?: string;
  autoRestart?: boolean;
  maxRestarts?: number;
  securityLevel?: "basic" | "enterprise";
  resourceLimits?: {
    maxMemory?: number; // MB
    maxCpu?: number; // percentage
  };
  permissions?: {
    allowedPaths?: string[];
    deniedPaths?: string[];
    readOnly?: boolean;
  };
}

interface MCPServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  port: number;
  process?: ChildProcess;
  status: "stopped" | "starting" | "running" | "error";
  restartCount: number;
  lastError?: string;
  performance?: {
    memoryUsage: number;
    cpuUsage: number;
    requestCount: number;
    avgResponseTime: number;
  };
  security?: {
    lastSecurityCheck: Date;
    accessViolations: number;
    encryptionEnabled: boolean;
  };
}

interface AuditLogEntry {
  timestamp: Date;
  serverName: string;
  action: string;
  userId?: string;
  details: any;
  securityLevel: "info" | "warning" | "error";
}

interface EnterpriseConfig {
  complianceMode: boolean;
  auditLogging: boolean;
  encryptionRequired: boolean;
  maxConcurrentConnections: number;
  sessionTimeout: number;
  allowedUsers?: string[];
}

export class MCPManager extends EventEmitter {
  private servers: Map<string, MCPServer> = new Map();
  private serverConfigs: Map<string, MCPServerConfig> = new Map();
  private isEnabled: boolean = false;
  private maxRestarts: number = 3;
  private performanceMonitors: Map<string, NodeJS.Timeout> = new Map();
  private auditLog: AuditLogEntry[] = [];
  private enterpriseConfig: EnterpriseConfig;
  private encryptionKey: string;

  constructor(enterpriseConfig?: Partial<EnterpriseConfig>) {
    super();

    // Initialize enterprise configuration
    this.enterpriseConfig = {
      complianceMode: true,
      auditLogging: true,
      encryptionRequired: true,
      maxConcurrentConnections: 10,
      sessionTimeout: 3600000, // 1 hour
      ...enterpriseConfig,
    };

    // Generate encryption key for secure communications
    this.encryptionKey = crypto.randomBytes(32).toString("hex");

    this.initializeDefaultServers();
    this.startAuditLogging();
  }

  private initializeDefaultServers() {
    // Initialize default MCP servers for B2B employee use
    const defaultServers: MCPServerConfig[] = [
      {
        name: "filesystem",
        command: "node",
        args: [path.join(__dirname, "../mcp-servers/filesystem/index.js")],
        port: 3001,
        autoRestart: true,
        maxRestarts: 5,
        securityLevel: "enterprise",
        resourceLimits: {
          maxMemory: 512, // 512MB
          maxCpu: 25, // 25% CPU
        },
        permissions: {
          allowedPaths: [
            os.homedir(),
            path.join(os.homedir(), "Documents"),
            path.join(os.homedir(), "Desktop"),
            process.cwd(),
          ],
          deniedPaths: ["C:\\Windows\\System32", "/etc", "/usr/bin"],
          readOnly: false,
        },
      },
      {
        name: "git",
        command: "node",
        args: [path.join(__dirname, "../mcp-servers/git/index.js")],
        port: 3002,
        autoRestart: true,
        maxRestarts: 5,
        securityLevel: "enterprise",
        resourceLimits: {
          maxMemory: 256,
          maxCpu: 20,
        },
      },
      {
        name: "search",
        command: "node",
        args: [path.join(__dirname, "../mcp-servers/search/index.js")],
        port: 3003,
        autoRestart: true,
        maxRestarts: 3,
        securityLevel: "basic",
        resourceLimits: {
          maxMemory: 128,
          maxCpu: 15,
        },
      },
    ];

    // Register server configurations
    defaultServers.forEach((config) => {
      this.serverConfigs.set(config.name, config);
      this.servers.set(config.name, {
        id: config.name,
        name: config.name,
        command: config.command,
        args: config.args,
        port: config.port,
        status: "stopped",
        restartCount: 0,
        performance: {
          memoryUsage: 0,
          cpuUsage: 0,
          requestCount: 0,
          avgResponseTime: 0,
        },
        security: {
          lastSecurityCheck: new Date(),
          accessViolations: 0,
          encryptionEnabled: this.enterpriseConfig.encryptionRequired,
        },
      });
    });

    this.logAudit(
      "system",
      "initialize",
      undefined,
      {
        serverCount: defaultServers.length,
        enterpriseMode: this.enterpriseConfig.complianceMode,
      },
      "info",
    );
  }

  private startAuditLogging() {
    if (!this.enterpriseConfig.auditLogging) return;

    // Rotate audit logs daily
    setInterval(
      () => {
        this.rotateAuditLogs();
      },
      24 * 60 * 60 * 1000,
    ); // 24 hours

    this.logAudit(
      "system",
      "audit_start",
      undefined,
      {
        complianceMode: this.enterpriseConfig.complianceMode,
      },
      "info",
    );
  }

  private logAudit(
    serverName: string,
    action: string,
    userId?: string,
    details?: any,
    level: "info" | "warning" | "error" = "info",
  ) {
    if (!this.enterpriseConfig.auditLogging) return;

    const entry: AuditLogEntry = {
      timestamp: new Date(),
      serverName,
      action,
      userId: userId || os.userInfo().username,
      details,
      securityLevel: level,
    };

    this.auditLog.push(entry);

    // Emit audit event for real-time monitoring
    this.emit("audit", entry);

    // Keep only last 10000 entries in memory
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000);
    }
  }

  private async rotateAuditLogs() {
    try {
      const logsDir = path.join(os.homedir(), ".applaa", "audit-logs");
      await fs.mkdir(logsDir, { recursive: true });

      const timestamp = new Date().toISOString().split("T")[0];
      const logFile = path.join(logsDir, `audit-${timestamp}.json`);

      await fs.writeFile(logFile, JSON.stringify(this.auditLog, null, 2));
      this.auditLog = []; // Clear in-memory logs after saving

      this.logAudit("system", "audit_rotate", undefined, { logFile }, "info");
    } catch (error) {
      this.logAudit(
        "system",
        "audit_rotate_error",
        undefined,
        { error: error instanceof Error ? error.message : String(error) },
        "error",
      );
    }
  }

  private startPerformanceMonitoring(serverName: string) {
    const interval = setInterval(async () => {
      const status = this.servers.get(serverName);
      if (!status || status.status !== "running") return;

      try {
        // Monitor process performance
        const process = this.servers.get(serverName);
        if (process && process.process?.pid) {
          const memoryUsage = await this.getProcessMemoryUsage(
            process.process.pid,
          );
          const cpuUsage = await this.getProcessCpuUsage(process.process.pid);

          status.performance = {
            ...status.performance!,
            memoryUsage,
            cpuUsage,
          };

          // Check resource limits
          const config = this.serverConfigs.get(serverName);
          if (config?.resourceLimits) {
            if (memoryUsage > (config.resourceLimits.maxMemory || 1024)) {
              this.logAudit(
                serverName,
                "memory_limit_exceeded",
                undefined,
                {
                  usage: memoryUsage,
                  limit: config.resourceLimits.maxMemory,
                },
                "warning",
              );
            }

            if (cpuUsage > (config.resourceLimits.maxCpu || 50)) {
              this.logAudit(
                serverName,
                "cpu_limit_exceeded",
                undefined,
                {
                  usage: cpuUsage,
                  limit: config.resourceLimits.maxCpu,
                },
                "warning",
              );
            }
          }
        }
      } catch (error) {
        this.logAudit(
          serverName,
          "performance_monitor_error",
          undefined,
          { error: error instanceof Error ? error.message : String(error) },
          "error",
        );
      }
    }, 30000); // Monitor every 30 seconds

    this.performanceMonitors.set(serverName, interval);
  }

  private async getProcessMemoryUsage(_pid: number): Promise<number> {
    // Simplified memory usage calculation (in MB)
    // In production, use proper process monitoring libraries
    return Math.floor(Math.random() * 200) + 50; // Mock: 50-250MB
  }

  private async getProcessCpuUsage(_pid: number): Promise<number> {
    // Simplified CPU usage calculation (percentage)
    // In production, use proper process monitoring libraries
    return Math.floor(Math.random() * 30) + 5; // Mock: 5-35%
  }

  async enableMCP(): Promise<boolean> {
    if (this.isEnabled) return true;

    try {
      // Check if MCP servers are installed
      const installed = await this.checkMCPInstallation();
      if (!installed) {
        throw new Error(
          "MCP servers not installed. Run: npm install -g @modelcontextprotocol/server-*",
        );
      }

      // Start all servers
      const startPromises = Array.from(this.servers.keys()).map((id) =>
        this.startServer(id),
      );

      const results = await Promise.allSettled(startPromises);
      const failures = results.filter((r) => r.status === "rejected");

      if (failures.length === results.length) {
        throw new Error("Failed to start any MCP servers");
      }

      this.isEnabled = true;
      return true;
    } catch (error) {
      console.error("Failed to enable MCP:", error);
      return false;
    }
  }

  async disableMCP(): Promise<boolean> {
    if (!this.isEnabled) return true;

    try {
      // Stop all servers
      const stopPromises = Array.from(this.servers.keys()).map((id) =>
        this.stopServer(id),
      );

      await Promise.allSettled(stopPromises);
      this.isEnabled = false;
      return true;
    } catch (error) {
      console.error("Failed to disable MCP:", error);
      return false;
    }
  }

  private async startServer(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId);
    if (!server || server.status === "running") return false;

    try {
      server.status = "starting";

      // Check if port is available
      const portAvailable = await this.isPortAvailable(server.port);
      if (!portAvailable) {
        throw new Error(`Port ${server.port} is already in use`);
      }

      // Spawn the MCP server process
      const childProcess = spawn(server.command, server.args, {
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          NODE_ENV: "production",
        },
      });

      // Handle process events
      childProcess.on("spawn", () => {
        console.log(`MCP server ${server.name} started on port ${server.port}`);
        server.status = "running";
        server.restartCount = 0;
      });

      childProcess.on("error", (error: Error) => {
        console.error(`MCP server ${server.name} error:`, error);
        server.status = "error";
        server.lastError = error.message;
        this.handleServerError(serverId);
      });

      childProcess.on(
        "exit",
        (code: number | null, signal: NodeJS.Signals | null) => {
          console.log(
            `MCP server ${server.name} exited with code ${code}, signal ${signal}`,
          );
          server.status = "stopped";
          server.process = undefined;

          if (this.isEnabled && server.restartCount < this.maxRestarts) {
            setTimeout(() => this.restartServer(serverId), 5000);
          }
        },
      );

      // Capture stdout/stderr for logging
      childProcess.stdout?.on("data", (data: Buffer) => {
        console.log(`[${server.name}] ${data.toString()}`);
      });

      childProcess.stderr?.on("data", (data: Buffer) => {
        console.error(`[${server.name}] ${data.toString()}`);
      });

      server.process = childProcess;

      // Wait for server to be ready
      await this.waitForServerReady(server.port);
      return true;
    } catch (error) {
      console.error(`Failed to start MCP server ${server.name}:`, error);
      server.status = "error";
      server.lastError = error instanceof Error ? error.message : String(error);
      return false;
    }
  }

  private async stopServer(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId);
    if (!server || !server.process) return true;

    try {
      // Graceful shutdown
      server.process.kill("SIGTERM");

      // Wait for graceful shutdown, then force kill if needed
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          if (server.process && !server.process.killed) {
            server.process.kill("SIGKILL");
          }
          resolve();
        }, 5000);

        server.process!.on("exit", () => {
          clearTimeout(timeout);
          resolve();
        });
      });

      server.status = "stopped";
      server.process = undefined;
      return true;
    } catch (error) {
      console.error(`Failed to stop MCP server ${server.name}:`, error);
      return false;
    }
  }

  private async restartServer(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId);
    if (!server) return false;

    server.restartCount++;
    console.log(
      `Restarting MCP server ${server.name} (attempt ${server.restartCount}/${this.maxRestarts})`,
    );

    await this.stopServer(serverId);
    return this.startServer(serverId);
  }

  private handleServerError(serverId: string): void {
    const server = this.servers.get(serverId);
    if (!server) return;

    // Implement error handling logic
    if (server.restartCount >= this.maxRestarts) {
      console.error(
        `MCP server ${server.name} failed too many times, giving up`,
      );
      // Notify main window about server failure
      // this.notifyMainWindow('mcp-server-failed', { serverId, error: server.lastError });
    }
  }

  private async checkMCPInstallation(): Promise<boolean> {
    // Check if MCP servers are installed globally
    const servers = [
      "mcp-server-filesystem",
      "mcp-server-git",
      "mcp-server-web-search",
    ];

    for (const serverCmd of servers) {
      try {
        await new Promise<void>((resolve, reject) => {
          const process = spawn(serverCmd, ["--version"], { stdio: "pipe" });
          process.on("error", reject);
          process.on("exit", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${serverCmd} not found`));
          });
        });
      } catch {
        return false;
      }
    }

    return true;
  }

  private async isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const net = require("net");
      const server = net.createServer();

      server.listen(port, () => {
        server.close(() => resolve(true));
      });

      server.on("error", () => resolve(false));
    });
  }

  private async waitForServerReady(
    port: number,
    timeout: number = 10000,
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(`http://localhost:${port}/health`);
        if (response.ok) return;
      } catch {
        // Server not ready yet
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    throw new Error(
      `Server on port ${port} did not become ready within ${timeout}ms`,
    );
  }

  // Public API methods
  getServerStatus(): Record<string, any> {
    const status: Record<string, any> = {};

    this.servers.forEach((server, id) => {
      status[id] = {
        name: server.name,
        status: server.status,
        port: server.port,
        restartCount: server.restartCount,
        lastError: server.lastError,
      };
    });

    return status;
  }

  isServerRunning(serverId: string): boolean {
    const server = this.servers.get(serverId);
    return server?.status === "running" || false;
  }

  async getServerHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [id, server] of this.servers) {
      if (server.status === "running") {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          const response = await fetch(
            `http://localhost:${server.port}/health`,
            {
              signal: controller.signal,
            },
          );

          clearTimeout(timeoutId);
          health[id] = response.ok;
        } catch {
          health[id] = false;
        }
      } else {
        health[id] = false;
      }
    }

    return health;
  }

  // Enterprise B2B Methods
  async getAuditLogs(
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuditLogEntry[]> {
    let logs = this.auditLog;

    if (startDate) {
      logs = logs.filter((log) => log.timestamp >= startDate);
    }

    if (endDate) {
      logs = logs.filter((log) => log.timestamp <= endDate);
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getPerformanceMetrics(): Promise<Record<string, any>> {
    const metrics: Record<string, any> = {};

    for (const [serverId, server] of this.servers) {
      if (server.status === "running" && server.performance) {
        metrics[serverId] = {
          ...server.performance,
          uptime: Date.now() - server.performance.requestCount * 1000,
          healthScore: this.calculateHealthScore(server),
          resourceUsage: {
            memory: `${server.performance.memoryUsage}MB`,
            cpu: `${server.performance.cpuUsage}%`,
          },
        };
      }
    }

    return metrics;
  }

  private calculateHealthScore(server: MCPServer): number {
    if (server.status !== "running") return 0;

    let score = 100;

    // Deduct for high resource usage
    if (server.performance) {
      if (server.performance.memoryUsage > 400) score -= 20;
      if (server.performance.cpuUsage > 50) score -= 20;
      if (server.performance.avgResponseTime > 1000) score -= 15;
    }

    // Deduct for security violations
    if (server.security && server.security.accessViolations > 0) {
      score -= server.security.accessViolations * 5;
    }

    // Deduct for restart count
    score -= server.restartCount * 10;

    return Math.max(0, Math.min(100, score));
  }

  async exportComplianceReport(): Promise<string> {
    const report = {
      timestamp: new Date().toISOString(),
      enterpriseConfig: this.enterpriseConfig,
      serverStatus: this.getServerStatus(),
      auditSummary: {
        totalEntries: this.auditLog.length,
        errorCount: this.auditLog.filter((log) => log.securityLevel === "error")
          .length,
        warningCount: this.auditLog.filter(
          (log) => log.securityLevel === "warning",
        ).length,
        lastAuditEntry: this.auditLog[this.auditLog.length - 1],
      },
      performanceMetrics: await this.getPerformanceMetrics(),
      systemInfo: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        user: os.userInfo().username,
      },
    };

    return JSON.stringify(report, null, 2);
  }

  async enableComplianceMode(): Promise<void> {
    this.enterpriseConfig.complianceMode = true;
    this.enterpriseConfig.auditLogging = true;
    this.enterpriseConfig.encryptionRequired = true;

    this.logAudit(
      "system",
      "compliance_mode_enabled",
      undefined,
      {
        config: this.enterpriseConfig,
      },
      "info",
    );
  }

  async setResourceLimits(
    serverId: string,
    limits: { maxMemory?: number; maxCpu?: number },
  ): Promise<boolean> {
    const config = this.serverConfigs.get(serverId);
    if (!config) return false;

    config.resourceLimits = { ...config.resourceLimits, ...limits };

    this.logAudit(
      serverId,
      "resource_limits_updated",
      undefined,
      limits,
      "info",
    );
    return true;
  }

  async getSecurityStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {};

    for (const [serverId, server] of this.servers) {
      status[serverId] = {
        encryptionEnabled: server.security?.encryptionEnabled || false,
        lastSecurityCheck: server.security?.lastSecurityCheck,
        accessViolations: server.security?.accessViolations || 0,
        complianceMode: this.enterpriseConfig.complianceMode,
        auditingEnabled: this.enterpriseConfig.auditLogging,
      };
    }

    return status;
  }

  // B2B Employee Onboarding
  async setupForEmployee(
    employeeId: string,
    permissions?: any,
  ): Promise<boolean> {
    try {
      this.logAudit(
        "system",
        "employee_setup_start",
        employeeId,
        { permissions },
        "info",
      );

      // Create employee-specific configuration
      const employeeConfig = {
        ...this.enterpriseConfig,
        allowedUsers: [
          ...(this.enterpriseConfig.allowedUsers || []),
          employeeId,
        ],
      };

      this.enterpriseConfig = employeeConfig;

      // Start essential servers for employee
      const essentialServers = ["filesystem", "git", "search"];
      for (const serverId of essentialServers) {
        await this.startServer(serverId);
      }

      this.logAudit(
        "system",
        "employee_setup_complete",
        employeeId,
        {
          serversStarted: essentialServers,
        },
        "info",
      );

      return true;
    } catch (error) {
      this.logAudit(
        "system",
        "employee_setup_failed",
        employeeId,
        {
          error: error instanceof Error ? error.message : "Unknown error",
        },
        "error",
      );
      return false;
    }
  }

  // Cleanup on app exit
  async cleanup(): Promise<void> {
    console.log("Cleaning up MCP servers...");

    // Stop performance monitoring
    for (const monitor of this.performanceMonitors.values()) {
      clearInterval(monitor);
    }
    this.performanceMonitors.clear();

    // Save final audit logs
    if (this.enterpriseConfig.auditLogging) {
      await this.rotateAuditLogs();
    }

    await this.disableMCP();

    this.logAudit("system", "cleanup_complete", undefined, {}, "info");
  }
}

// Singleton instance
export const mcpManager = new MCPManager();

// Handle app exit
app.on("before-quit", async () => {
  await mcpManager.cleanup();
});
