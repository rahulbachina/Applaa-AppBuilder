import React, { useState } from "react";
import {
  Search,
  Plus,
  Download,
  Settings,
  ExternalLink,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface MCPIntegration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category:
    | "automation"
    | "database"
    | "version-control"
    | "design"
    | "communication"
    | "cloud"
    | "search"
    | "storage"
    | "analytics";
  isLocal: boolean;
  isInstalled: boolean;
  isLoading?: boolean;
  website?: string;
}

const MOCK_INTEGRATIONS: MCPIntegration[] = [
  {
    id: "puppeteer",
    name: "Puppeteer",
    description:
      "Enables browser automation and web scraping with Puppeteer, allowing LLMs to interact with web pages, take screenshots, and extract data.",
    icon: "P",
    category: "automation",
    isLocal: true,
    isInstalled: false,
    website: "https://pptr.dev/",
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    description:
      "Provides read-only access to PostgreSQL databases, enabling LLMs to inspect database schemas and execute read queries.",
    icon: "P",
    category: "database",
    isLocal: true,
    isInstalled: true,
  },
  {
    id: "github",
    name: "GitHub",
    description:
      "Integrates with the GitHub API, enabling repository management, file operations, issue tracking, search functionality, and more.",
    icon: "G",
    category: "version-control",
    isLocal: true,
    isInstalled: true,
    website: "https://github.com",
  },
  {
    id: "figma",
    name: "Figma AI Bridge",
    description:
      "Offers tools to view, comment on, and analyze Figma designs, ensuring precise implementation with relevant design context.",
    icon: "F",
    category: "design",
    isLocal: true,
    isInstalled: false,
    website: "https://figma.com",
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Enables AI assistants to interact with Slack workspaces, providing tools for messaging, channel management, and team collaboration.",
    icon: "S",
    category: "communication",
    isLocal: false,
    isInstalled: false,
    website: "https://slack.com",
  },
  {
    id: "gitlab",
    name: "GitLab",
    description:
      "Enables comprehensive GitLab project management including file operations, issue tracking, merge requests, and CI/CD pipeline management.",
    icon: "G",
    category: "version-control",
    isLocal: true,
    isInstalled: false,
    website: "https://gitlab.com",
  },
  {
    id: "time",
    name: "Time",
    description:
      "Provides time and timezone conversion capabilities using IANA timezone names, with automatic system timezone detection.",
    icon: "T",
    category: "automation",
    isLocal: false,
    isInstalled: false,
  },
  {
    id: "google-maps",
    name: "Google Maps",
    description:
      "Location services, directions, and place details using Google Maps API for geographic and navigation queries.",
    icon: "G",
    category: "search",
    isLocal: false,
    isInstalled: false,
    website: "https://maps.google.com",
  },
  {
    id: "aws-kb",
    name: "AWS Knowledge Base",
    description:
      "Retrieves information from AWS Knowledge Base using Bedrock Agent Runtime, supporting RAG-based queries and document search.",
    icon: "A",
    category: "cloud",
    isLocal: false,
    isInstalled: false,
    website: "https://aws.amazon.com",
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description:
      "File access and search capabilities for Google Drive, enabling document management and content retrieval.",
    icon: "G",
    category: "storage",
    isLocal: false,
    isInstalled: false,
    website: "https://drive.google.com",
  },
  {
    id: "sequential-thinking",
    name: "Sequential Thinking",
    description:
      "A structured problem-solving tool that enables step-by-step analysis, thought revision, and branching logic for complex reasoning.",
    icon: "S",
    category: "analytics",
    isLocal: false,
    isInstalled: false,
  },
  {
    id: "redis",
    name: "Redis",
    description:
      "Provides access to Redis key-value store, enabling operations like setting, getting, deleting, and listing keys with TTL support.",
    icon: "R",
    category: "database",
    isLocal: false,
    isInstalled: false,
    website: "https://redis.io",
  },
];

const CATEGORY_COLORS = {
  automation: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  database: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "version-control":
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  design: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  communication:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  cloud:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  search:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  storage: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
  analytics: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export function MCPMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [integrations, setIntegrations] =
    useState<MCPIntegration[]>(MOCK_INTEGRATIONS);

  const categories = [
    { id: "all", label: "All" },
    { id: "automation", label: "Automation" },
    { id: "database", label: "Database" },
    { id: "version-control", label: "Version Control" },
    { id: "design", label: "Design" },
    { id: "communication", label: "Communication" },
    { id: "cloud", label: "Cloud" },
    { id: "search", label: "Search" },
    { id: "storage", label: "Storage" },
    { id: "analytics", label: "Analytics" },
  ];

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = async (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? { ...integration, isLoading: true }
          : integration,
      ),
    );

    // Simulate installation
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId
            ? { ...integration, isLoading: false, isInstalled: true }
            : integration,
        ),
      );
    }, 2000);
  };

  const handleUninstall = async (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? { ...integration, isInstalled: false }
          : integration,
      ),
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            MCP Marketplace
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Discover and install Model Context Protocol integrations to extend
            Applaa's capabilities
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Custom
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIntegrations.map((integration) => (
          <Card key={integration.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center text-white font-bold">
                    {integration.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {integration.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${CATEGORY_COLORS[integration.category]}`}
                      >
                        {integration.category.replace("-", " ")}
                      </Badge>
                      {integration.isLocal && (
                        <Badge variant="outline" className="text-xs">
                          Local
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {integration.website && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(integration.website, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm mb-4 line-clamp-3">
                {integration.description}
              </CardDescription>
              <div className="flex items-center justify-between">
                {integration.isInstalled ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUninstall(integration.id)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                    <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                      <Check className="w-4 h-4 mr-1" />
                      Installed
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleInstall(integration.id)}
                    disabled={integration.isLoading}
                    className="bg-gradient-to-r from-orange-500 to-green-500 hover:from-orange-600 hover:to-green-600"
                  >
                    {integration.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-1" />
                        Install
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No integrations found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
