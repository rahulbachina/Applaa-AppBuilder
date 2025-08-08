import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Server,
  GitBranch,
  Search,
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { showSuccess, showError } from "@/lib/toast";

interface MCPServer {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "error" | "starting";
  description: string;
  version?: string;
  port?: number;
  endpoint?: string;
  restartCount?: number;
  lastError?: string;
}

export function MCPIntegration() {
  const { settings, updateSettings } = useSettings();
  const [isToggling, setIsToggling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Local MCP servers for desktop app
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([
    {
      id: "filesystem",
      name: "File System",
      status: "disconnected",
      description: "Access and manage local files and directories (Local)",
      version: "1.0.0",
      port: 3001,
      endpoint: "localhost:3001",
    },
    {
      id: "git",
      name: "Git Integration",
      status: "disconnected",
      description: "Git repository operations and version control (Local)",
      version: "1.2.1",
      port: 3002,
      endpoint: "localhost:3002",
    },
    {
      id: "web-search",
      name: "Web Search",
      status: "disconnected",
      description: "Search the web for information and resources (Local)",
      port: 3003,
      endpoint: "localhost:3003",
    },
  ]);

  // Simulate MCP manager communication (in real app, this would use IPC)
  const checkMCPServerStatus = async () => {
    if (!settings?.enableMCP) {
      setMcpServers((prev) =>
        prev.map((server) => ({ ...server, status: "disconnected" as const })),
      );
      return;
    }

    setIsRefreshing(true);
    try {
      // Simulate checking local MCP servers
      const updatedServers = await Promise.all(
        mcpServers.map(async (server) => {
          try {
            // In real app, this would check if local MCP server is running
            const isRunning = Math.random() > 0.3; // Simulate 70% success rate
            return {
              ...server,
              status: isRunning
                ? ("connected" as const)
                : ("disconnected" as const),
              lastError: isRunning ? undefined : "Server not responding",
            };
          } catch {
            return {
              ...server,
              status: "error" as const,
              lastError: "Failed to connect to local server",
            };
          }
        }),
      );
      setMcpServers(updatedServers);
    } catch {
      showError("Failed to check MCP server status");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkMCPServerStatus();
  }, [settings?.enableMCP]);

  const handleToggleMCP = async (enabled: boolean) => {
    setIsToggling(true);
    try {
      if (enabled) {
        // In real app, this would start local MCP servers
        showSuccess("Starting local MCP servers...");
        setMcpServers((prev) =>
          prev.map((server) => ({ ...server, status: "starting" as const })),
        );

        // Simulate server startup
        setTimeout(() => {
          checkMCPServerStatus();
        }, 2000);
      } else {
        // In real app, this would stop local MCP servers
        showSuccess("Stopping local MCP servers...");
        setMcpServers((prev) =>
          prev.map((server) => ({
            ...server,
            status: "disconnected" as const,
          })),
        );
      }

      const result = await updateSettings({
        enableMCP: enabled,
      });

      if (result) {
        showSuccess(`MCP ${enabled ? "enabled" : "disabled"} successfully`);
      } else {
        showError(`Failed to ${enabled ? "enable" : "disable"} MCP`);
      }
    } catch (err: any) {
      showError(err.message || "An error occurred while updating MCP settings");
    } finally {
      setIsToggling(false);
    }
  };

  const getStatusIcon = (status: MCPServer["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "starting":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return (
          <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-600" />
        );
    }
  };

  const getStatusBadge = (status: MCPServer["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            Connected
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "starting":
        return (
          <Badge
            variant="default"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            Starting
          </Badge>
        );
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  const getServerIcon = (serverId: string) => {
    switch (serverId) {
      case "filesystem":
        return <Server className="h-4 w-4" />;
      case "git":
        return <GitBranch className="h-4 w-4" />;
      case "web-search":
        return <Search className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const isMCPEnabled = !!settings?.enableMCP;

  return (
    <div className="space-y-4">
      {/* MCP Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Model Context Protocol (MCP) - Local Desktop
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enable local MCP servers for desktop app integration
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Switch
            id="enable-mcp"
            checked={isMCPEnabled}
            onCheckedChange={handleToggleMCP}
            disabled={isToggling}
          />
          <Label htmlFor="enable-mcp" className="text-sm">
            {isToggling ? "Updating..." : isMCPEnabled ? "Enabled" : "Disabled"}
          </Label>
        </div>
      </div>

      {isMCPEnabled && (
        <>
          <Separator />

          {/* MCP Servers Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Local MCP Servers
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkMCPServerStatus}
                  disabled={isRefreshing}
                  className="h-6 w-6 p-0 ml-auto"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mcpServers.map((server) => (
                <div
                  key={server.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getServerIcon(server.id)}
                    {getStatusIcon(server.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {server.name}
                        </span>
                        {server.version && (
                          <Badge variant="outline" className="text-xs">
                            v{server.version}
                          </Badge>
                        )}
                        {server.endpoint && (
                          <Badge
                            variant="outline"
                            className="text-xs font-mono"
                          >
                            {server.endpoint}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {server.description}
                      </p>
                      {server.lastError && (
                        <p className="text-xs text-red-500 mt-1">
                          Error: {server.lastError}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(server.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        // TODO: Open server configuration
                        showSuccess(`Opening ${server.name} configuration`);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Local MCP Information */}
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Server className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Local Desktop MCP
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    MCP servers run locally on your machine for maximum
                    performance and security. No VPS required for desktop
                    applications like Applaa, Trae, or Cursor.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-white dark:bg-gray-800"
                    >
                      ⚡ ~1ms latency
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs bg-white dark:bg-gray-800"
                    >
                      🔒 Local security
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs bg-white dark:bg-gray-800"
                    >
                      💰 No hosting costs
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MCP Configuration Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Install MCP servers locally
                showSuccess("Installing local MCP servers...");
              }}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Install MCP Servers
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Open MCP configuration
                showSuccess("Opening local MCP configuration");
              }}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Configure Local MCP
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
