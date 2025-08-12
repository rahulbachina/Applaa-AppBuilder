import { useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { PlusCircle, Pencil } from "lucide-react";
import { useAtom, useSetAtom } from "jotai";
import { selectedAppIdAtom } from "@/atoms/appAtoms";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { selectedChatIdAtom } from "@/atoms/chatAtoms";
import { useLoadApps } from "@/hooks/useLoadApps";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useCheckName } from "@/hooks/useCheckName";
import { IpcClient } from "@/ipc/ipc_client";

export function AppList({ show }: { show?: boolean }) {
  const navigate = useNavigate();
  const [selectedAppId, setSelectedAppId] = useAtom(selectedAppIdAtom);
  const setSelectedChatId = useSetAtom(selectedChatIdAtom);
  const { apps, loading, error } = useLoadApps();
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameAppId, setRenameAppId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const { data: nameCheck } = useCheckName(renameValue);

  if (!show) {
    return null;
  }

  const handleAppClick = async (id: number) => {
    setSelectedAppId(id);
    try {
      // Load chats for this app
      const chats = await IpcClient.getInstance().getChats(id);
      let chatId: number;
      if (chats && chats.length > 0) {
        chatId = chats[0].id;
      } else {
        // If no chat exists, create one
        chatId = await IpcClient.getInstance().createChat(id);
      }
      setSelectedChatId(chatId);
      navigate({ to: "/chat", search: { id: chatId } });
    } catch {
      // Fallback: go to app details if something goes wrong
      setSelectedChatId(null);
      navigate({ to: "/", search: { appId: id } });
    }
  };

  const handleNewApp = () => {
    navigate({ to: "/" });
    // We'll eventually need a create app workflow
  };

  return (
    <>
      <SidebarGroup className="overflow-y-auto h-[calc(100vh-112px)]">
        <SidebarGroupLabel>Your Apps</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleNewApp}
              variant="outline"
              className="flex items-center justify-start gap-2 mx-2 py-2"
            >
              <PlusCircle size={16} />
              <span>New App</span>
            </Button>

            {loading ? (
              <div className="py-2 px-4 text-sm text-gray-500">
                Loading apps...
              </div>
            ) : error ? (
              <div className="py-2 px-4 text-sm text-red-500">
                Error loading apps
              </div>
            ) : apps.length === 0 ? (
              <div className="py-2 px-4 text-sm text-gray-500">
                No apps found
              </div>
            ) : (
              <SidebarMenu className="space-y-1" data-testid="app-list">
                {apps.map((app) => (
                  <SidebarMenuItem key={app.id} className="mb-1">
                    <Button
                      variant="ghost"
                      onClick={() => handleAppClick(app.id)}
                      className={`relative justify-start w-full text-left py-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                        selectedAppId === app.id
                          ? "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-accent-foreground shadow-sm"
                          : ""
                      }`}
                      data-testid={`app-list-item-${app.name}`}
                    >
                      {selectedAppId === app.id && (
                        <span className="absolute left-0 top-1 bottom-1 w-1.5 rounded-r bg-[var(--applaa-orange)]" />
                      )}
                      <div className="flex items-center justify-between w-full gap-2">
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-medium">
                            {app.name.replace(/[-_]+/g, " ")}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(app.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 text-xs px-2 py-1 rounded-md border hover:bg-sidebar-accent/70"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenameAppId(app.id);
                            setRenameValue(app.name.replace(/[-_]+/g, " "));
                            setRenameOpen(true);
                          }}
                          title="Rename app"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Button>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Rename App</DialogTitle>
            <DialogDescription>
              Give your app a friendly name. The underlying folder will be
              updated safely.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter new app name"
            />
            {nameCheck?.exists && (
              <div className="text-xs text-red-600">
                An app with this name already exists.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!renameValue.trim() || nameCheck?.exists}
              onClick={async () => {
                if (!renameAppId) return;
                const newSlug = renameValue
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                try {
                  await IpcClient.getInstance().renameApp({
                    appId: renameAppId,
                    appName: renameValue.trim(),
                    appPath: newSlug || renameValue.trim(),
                  });
                  setRenameOpen(false);
                } catch {
                  // Swallow; global toast should display
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
