import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradePrompt({ open, onOpenChange }: UpgradePromptProps) {
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Upgrade Required</AlertDialogTitle>
          <AlertDialogDescription>
            Access to live streams and upcoming stream sections requires a Monthly or Annual membership. 
            Upgrade your plan to enjoy exclusive live content and premium features.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            onOpenChange(false);
            navigate("/plans");
          }}>
            View Plans
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
