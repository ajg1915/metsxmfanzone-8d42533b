import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, CreditCard, Shield } from "lucide-react";
import MembersTab from "@/components/admin/MembersTab";
import SubscriptionsTab from "@/components/admin/SubscriptionsTab";
import RolesTab from "@/components/admin/RolesTab";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("members");

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">User Management</h1>
        <p className="text-muted-foreground">
          Manage members, subscriptions, and roles — AI handles most tasks automatically
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="w-4 h-4" />
            Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <MembersTab />
        </TabsContent>

        <TabsContent value="subscriptions">
          <SubscriptionsTab />
        </TabsContent>

        <TabsContent value="roles">
          <RolesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
