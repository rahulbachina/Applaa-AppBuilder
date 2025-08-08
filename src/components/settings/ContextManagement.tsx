import React, { useState } from "react";
import {
  FolderOpen,
  Search,
  RefreshCw,
  Database,
  FileText,
  Settings,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

interface IndexedWorkspace {
  id: string;
  name: string;
  path: string;
  status: "indexed" | "indexing" | "error" | "pending";
  lastIndexed: Date;
  fileCount: number;
  size: string;
  isActive: boolean;
  languages: string[];
  indexProgress?: number;
}

interface IndexStats {
  totalFiles: number;
  totalSize: string;
  lastFullIndex: Date;
  indexingEnabled: boolean;
  autoReindex: boolean;
}

const MOCK_WORKSPACES: IndexedWorkspace[] = [
  {
    id: "applaa-builder",
    name: "ApplaaBuilder",
    path: "C:/Users/rahul/Documents/000-LaaAI-ApplaaProject/ApplaaBuilder",
    status: "indexed",
    lastIndexed: new Date("2024-01-15T10:30:00"),
    fileCount: 1247,
    size: "45.2 MB",
    isActive: true,
    languages: ["TypeScript", "JavaScript", "CSS", "HTML", "JSON"],
  },
  {
    id: "react-components",
    name: "React Components Library",
    path: "C:/Users/rahul/Projects/react-components",
    status: "indexing",
    lastIndexed: new Date("2024-01-14T15:20:00"),
    fileCount: 892,
    size: "32.1 MB",
    isActive: true,
    languages: ["TypeScript", "JavaScript", "CSS"],
    indexProgress: 67,
  },
  {
    id: "api-backend",
    name: "API Backend",
    path: "C:/Users/rahul/Projects/api-backend",
    status: "error",
    lastIndexed: new Date("2024-01-13T09:15:00"),
    fileCount: 456,
    size: "18.7 MB",
    isActive: false,
    languages: ["Python", "SQL", "YAML"],
  },
  {
    id: "mobile-app",
    name: "Mobile App",
    path: "C:/Users/rahul/Projects/mobile-app",
    status: "pending",
    lastIndexed: new Date("2024-01-12T14:45:00"),
    fileCount: 0,
    size: "0 MB",
    isActive: false,
    languages: [],
  },
];

const MOCK_STATS: IndexStats = {
  totalFiles: 2595,
  totalSize: "95.9 MB",
  lastFullIndex: new Date("2024-01-15T10:30:00"),
  indexingEnabled: true,
  autoReindex: true,
};

export function ContextManagement() {
  const [workspaces, setWorkspaces] =
    useState<IndexedWorkspace[]>(MOCK_WORKSPACES);
  const [stats, setStats] = useState<IndexStats>(MOCK_STATS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isReindexing, setIsReindexing] = useState(false);

  const filteredWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.path.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getStatusIcon = (status: IndexedWorkspace["status"]) => {
    switch (status) {
      case "indexed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "indexing":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: IndexedWorkspace["status"]) => {
    switch (status) {
      case "indexed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "indexing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleReindex = async (workspaceId: string) => {
    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === workspaceId
          ? { ...workspace, status: "indexing", indexProgress: 0 }
          : workspace,
      ),
    );

    // Simulate indexing progress
    const interval = setInterval(() => {
      setWorkspaces((prev) =>
        prev.map((workspace) => {
          if (workspace.id === workspaceId && workspace.status === "indexing") {
            const newProgress =
              (workspace.indexProgress || 0) + Math.random() * 20;
            if (newProgress >= 100) {
              clearInterval(interval);
              return {
                ...workspace,
                status: "indexed",
                indexProgress: undefined,
                lastIndexed: new Date(),
              };
            }
            return { ...workspace, indexProgress: newProgress };
          }
          return workspace;
        }),
      );
    }, 500);
  };

  const handleFullReindex = async () => {
    setIsReindexing(true);
    // Simulate full reindex
    setTimeout(() => {
      setIsReindexing(false);
      setStats((prev) => ({ ...prev, lastFullIndex: new Date() }));
    }, 3000);
  };

  const handleToggleWorkspace = (workspaceId: string) => {
    setWorkspaces((prev) =>
      prev.map((workspace) =>
        workspace.id === workspaceId
          ? { ...workspace, isActive: !workspace.isActive }
          : workspace,
      ),
    );
  };

  const handleRemoveWorkspace = (workspaceId: string) => {
    setWorkspaces((prev) =>
      prev.filter((workspace) => workspace.id !== workspaceId),
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            Context Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage code indexing and workspace context for enhanced AI
            assistance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullReindex}
            disabled={isReindexing}
          >
            {isReindexing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Reindexing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reindex All
              </>
            )}
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Workspace
          </Button>
        </div>
      </div>

      {/* Index Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Files
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.totalFiles.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <HardDrive className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Index Size
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stats.totalSize}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last Index
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatDate(stats.lastFullIndex)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Settings className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Auto Reindex
                </p>
                <Switch
                  checked={stats.autoReindex}
                  onCheckedChange={(checked) =>
                    setStats((prev) => ({ ...prev, autoReindex: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search workspaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Workspaces */}
      <div className="space-y-4">
        {filteredWorkspaces.map((workspace) => (
          <Card key={workspace.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(workspace.status)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {workspace.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {workspace.path}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-1">
                    <Badge className={getStatusColor(workspace.status)}>
                      {workspace.status}
                    </Badge>

                    {workspace.languages.length > 0 && (
                      <div className="flex gap-1">
                        {workspace.languages.slice(0, 3).map((lang) => (
                          <Badge
                            key={lang}
                            variant="outline"
                            className="text-xs"
                          >
                            {lang}
                          </Badge>
                        ))}
                        {workspace.languages.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{workspace.languages.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {workspace.fileCount.toLocaleString()} files •{" "}
                      {workspace.size}
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(workspace.lastIndexed)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleWorkspace(workspace.id)}
                  >
                    {workspace.isActive ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReindex(workspace.id)}
                    disabled={workspace.status === "indexing"}
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${workspace.status === "indexing" ? "animate-spin" : ""}`}
                    />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveWorkspace(workspace.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {workspace.status === "indexing" &&
                workspace.indexProgress !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                      <span>Indexing progress</span>
                      <span>{Math.round(workspace.indexProgress)}%</span>
                    </div>
                    <Progress value={workspace.indexProgress} className="h-2" />
                  </div>
                )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredWorkspaces.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <FolderOpen className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No workspaces found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add a workspace to start indexing your code for better AI assistance
          </p>
        </div>
      )}
    </div>
  );
}
