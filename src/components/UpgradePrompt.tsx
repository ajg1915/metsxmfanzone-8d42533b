import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UpgradePrompt({ open, onOpenChange }: UpgradePromptProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade Required</DialogTitle>
          <DialogDescription>
            Access to live streams and upcoming stream sections requires a Monthly or Annual membership. 
            Upgrade your plan to enjoy exclusive live content and premium features.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleClose}>
            Maybe Later
          </Button>
          <Button onClick={() => navigate("/pricing")}>
            View Membership
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
