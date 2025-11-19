import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function LiveStreamDisclaimer() {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-5 w-5" />
      <AlertDescription className="text-sm">
        <strong>Important Notice:</strong> Live stream access is limited to 2 devices per account. 
        Fans who abuse the service by using more than 2 devices will have their accounts 
        restricted, downgraded, or deactivated without warning. We monitor usage to ensure 
        fair access for all premium members.
      </AlertDescription>
    </Alert>
  );
}
