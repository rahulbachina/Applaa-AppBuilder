import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, Info } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { IpcClient } from "@/ipc/ipc_client";
import { hasDyadProKey } from "@/lib/schemas";

export function ProModeSelector() {
  const { settings, updateSettings } = useSettings();

  const toggleLazyEdits = () => {
    updateSettings({
      enableProLazyEditsMode: !settings?.enableProLazyEditsMode,
    });
  };

  const toggleSmartContext = () => {
    updateSettings({
      enableProSmartFilesContextMode: !settings?.enableProSmartFilesContextMode,
    });
  };

  const toggleProEnabled = () => {
    updateSettings({
      enableDyadPro: !settings?.enableDyadPro,
    });
  };

  const hasProKey = settings ? hasDyadProKey(settings) : false;
  const proModeTogglable = hasProKey && Boolean(settings?.enableDyadPro);

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="has-[>svg]:px-1.5 flex items-center gap-1.5 h-8 border-primary/50 hover:bg-primary/10 font-medium shadow-sm shadow-primary/10 transition-all hover:shadow-md hover:shadow-primary/15"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium text-xs-sm">Pro</span>
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Configure Applaa Pro settings</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-80 border-primary/20">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">Dyad Pro</span>
            </h4>
            <div className="h-px bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
          </div>
          {!hasProKey && (
            <div className="text-sm text-center text-muted-foreground">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                onClick={() => {
                  IpcClient.getInstance().openExternalUrl(
                    "https://dyad.sh/pro#ai",
                  );
                }}
              >
                Unlock Pro modes
              </a>
            </div>
          )}
          <div className="flex flex-col gap-5">
            <SelectorRow
              id="pro-enabled"
              label="Enable Dyad Pro"
              description="Use Dyad Pro AI credits"
              tooltip="Uses Dyad Pro AI credits for the main AI model and Pro modes."
              isTogglable={hasProKey}
              settingEnabled={Boolean(settings?.enableDyadPro)}
              toggle={toggleProEnabled}
            />
            <SelectorRow
              id="lazy-edits"
              label="Turbo Edits"
              description="Makes file edits faster and cheaper"
              tooltip="Uses a faster, cheaper model to generate full file updates."
              isTogglable={proModeTogglable}
              settingEnabled={Boolean(settings?.enableProLazyEditsMode)}
              toggle={toggleLazyEdits}
            />
            <SelectorRow
              id="smart-context"
              label="Smart Context"
              description="Optimizes your AI's code context"
              tooltip="Improve efficiency and save credits working on large codebases."
              isTogglable={proModeTogglable}
              settingEnabled={Boolean(settings?.enableProSmartFilesContextMode)}
              toggle={toggleSmartContext}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SelectorRow({
  id,
  label,
  description,
  tooltip,
  isTogglable,
  settingEnabled,
  toggle,
}: {
  id: string;
  label: string;
  description: string;
  tooltip: string;
  isTogglable: boolean;
  settingEnabled: boolean;
  toggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1.5">
        <Label
          htmlFor={id}
          className={!isTogglable ? "text-muted-foreground/50" : ""}
        >
          {label}
        </Label>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className={`h-4 w-4 cursor-help ${!isTogglable ? "text-muted-foreground/50" : "text-muted-foreground"}`}
              />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-72">
              {tooltip}
            </TooltipContent>
          </Tooltip>
          <p
            className={`text-xs ${!isTogglable ? "text-muted-foreground/50" : "text-muted-foreground"} max-w-55`}
          >
            {description}
          </p>
        </div>
      </div>
      <Switch
        id={id}
        checked={isTogglable ? settingEnabled : false}
        onCheckedChange={toggle}
        disabled={!isTogglable}
      />
    </div>
  );
}
