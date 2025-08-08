import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useState } from "react";
import { ImportAppDialog } from "./ImportAppDialog";

export function ImportAppButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div className="px-4 pb-1 flex justify-center">
        <Button
          variant="applaa"
          size="lg"
          onClick={() => setIsDialogOpen(true)}
          className="font-semibold"
        >
          <Upload className="mr-2 h-5 w-5" />
          Import App
        </Button>
      </div>
      <ImportAppDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
