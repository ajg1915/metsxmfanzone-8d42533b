import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive",
      });
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === "granted") {
        await subscribeToPushNotifications();
        return true;
      } else {
        toast({
          title: "Permission Denied",
          description: "You won't receive notifications about news and updates",
        });
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        title: "Error",
        description: "Failed to request notification permission",
        variant: "destructive",
      });
      return false;
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("User not authenticated");
        return;
      }

      // Register service worker for push notifications
      const registration = await navigator.serviceWorker.ready;

      // Get or create push subscription
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Generate VAPID key (you should generate your own and store it securely)
        const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
        
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      // Store subscription in database
      const subscriptionJSON = subscription.toJSON();
      
      const { error } = await supabase
        .from("notification_subscriptions")
        .upsert({
          user_id: user.id,
          endpoint: subscriptionJSON.endpoint || "",
          p256dh: subscriptionJSON.keys?.p256dh || "",
          auth: subscriptionJSON.keys?.auth || "",
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: "Notifications Enabled",
        description: "You'll receive notifications about news and updates!",
      });
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      toast({
        title: "Error",
        description: "Failed to enable notifications",
        variant: "destructive",
      });
    }
  };

  const unsubscribe = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      const { error } = await supabase
        .from("notification_subscriptions")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setIsSubscribed(false);
      toast({
        title: "Notifications Disabled",
        description: "You won't receive notifications anymore",
      });
    } catch (error) {
      console.error("Error unsubscribing from notifications:", error);
      toast({
        title: "Error",
        description: "Failed to disable notifications",
        variant: "destructive",
      });
    }
  };

  return {
    permission,
    isSubscribed,
    requestPermission,
    unsubscribe,
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
