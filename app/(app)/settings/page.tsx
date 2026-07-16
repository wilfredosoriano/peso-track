import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountInfo } from "@/components/settings/account-info";
import { PaydaySettingsForm } from "@/components/settings/payday-settings-form";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { NotificationSettingsForm } from "@/components/settings/notification-settings-form";
import { PushNotificationToggle } from "@/components/settings/push-notification-toggle";
import { Separator } from "@/components/ui/separator";
import { DataExportCard } from "@/components/settings/data-export-card";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { getOrCreateCurrentUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await getOrCreateCurrentUser();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountInfo email={user.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payday</CardTitle>
        </CardHeader>
        <CardContent>
          <PaydaySettingsForm payCutoffDay1={user.payCutoffDay1} payCutoffDay2={user.payCutoffDay2} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationSettingsForm
            notifyDueSoon={user.notifyDueSoon}
            notifyOverdue={user.notifyOverdue}
            notifyDaysAhead={user.notifyDaysAhead}
          />
          <Separator />
          <PushNotificationToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
        </CardHeader>
        <CardContent>
          <DataExportCard />
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  );
}
