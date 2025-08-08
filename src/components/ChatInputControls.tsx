import { ContextFilesPicker } from "./ContextFilesPicker";
import { ModelPicker } from "./ModelPicker";
import { ImportAppIcon } from "./ImportAppIcon";
// import { ProModeSelector } from "./ProModeSelector"; // Disabled Pro button
import { ChatModeSelector } from "./ChatModeSelector";

export function ChatInputControls({
  showContextFilesPicker = false,
}: {
  showContextFilesPicker?: boolean;
}) {
  return (
    <div className="flex">
      <ChatModeSelector />
      <div className="w-1.5"></div>
      <ModelPicker />
      <div className="w-1.5"></div>
      <ImportAppIcon />
      {/* <div className="w-1.5"></div>
      <ProModeSelector /> */}{" "}
      {/* Disabled Pro button */}
      <div className="w-1"></div>
      {showContextFilesPicker && (
        <>
          <ContextFilesPicker />
          <div className="w-0.5"></div>
        </>
      )}
    </div>
  );
}
