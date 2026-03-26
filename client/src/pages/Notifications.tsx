import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/DashboardNav";
import { Bell, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

const notificationIcons = {
  task_update: AlertCircle,
  ai_insight: CheckCircle2,
  document_shared: Info,
  system: Bell,
};

const notificationColors = {
  task_update: "bg-blue-100 text-blue-800",
  ai_insight: "bg-green-100 text-green-800",
  document_shared: "bg-purple-100 text-purple-800",
  system: "bg-gray-100 text-gray-800",
};

export default function Notifications() {
  const { data: notifications = [], isLoading, refetch } = trpc.notifications.list.useQuery();
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const unreadCount = notifications.filter((n) => n.isRead === "unread").length;

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate({ id: notificationId });
  };

  const handleMarkAllAsRead = () => {
    notifications
      .filter((n) => n.isRead === "unread")
      .forEach((n) => {
        markAsReadMutation.mutate({ id: n.id });
      });
    toast.success("All notifications marked as read");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardNav />

      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
              <p className="text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All caught up!"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={handleMarkAllAsRead} variant="outline">
                Mark all as read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">Loading notifications...</p>
                </CardContent>
              </Card>
            ) : notifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No notifications yet</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notification) => {
                const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || Bell;
                const isUnread = notification.isRead === "unread";
                return (
                  <Card
                    key={notification.id}
                    className={`${isUnread ? "border-accent bg-accent/5" : ""} hover:shadow-md transition-shadow`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div
                            className={`p-3 rounded-lg ${notificationColors[notification.type as keyof typeof notificationColors]}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-foreground mb-1">
                                {notification.title}
                              </h3>
                              {notification.message && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                  {notification.type.replace("_", " ")}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(notification.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>

                            {isUnread && (
                              <Button
                                onClick={() => handleMarkAsRead(notification.id)}
                                size="sm"
                                variant="outline"
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
