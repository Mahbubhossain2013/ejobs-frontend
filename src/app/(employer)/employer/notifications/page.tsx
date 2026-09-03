"use client";

import React, { useEffect, useState } from "react";
import { useThemeStore } from "@/store/theme-store";
import { notificationsService } from "@/services/notifications.service";
import { useNotificationStore } from "@/store/notification-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Check, CheckCheck } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function NotificationsPage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { markAllAsRead, setUnreadCount } = useNotificationStore();

  useEffect(() => {
    notificationsService
      .getNotifications()
      .then((res) => {
        const items = res?.data || [];
        setNotifications(items);
        setUnreadCount(res?.unread_count ?? items.filter((n: any) => !n.read_at).length);
      })
      .catch(() => { /* handled */ })
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    await notificationsService.markAllAsRead();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
    markAllAsRead();
  };

  const handleMarkRead = async (id: number) => {
    await notificationsService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  // Laravel DatabaseNotification stores data in n.data (nested)
  const getTitle = (n: any) => n.data?.title || n.title || "";
  const getMessage = (n: any) => n.data?.message || n.message || "";

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "নোটিফিকেশন" : "Notifications"}</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0
              ? `${unreadCount} ${isBn ? "টি পড়েনি" : "unread"}`
              : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            {isBn ? "সব পড়েছে" : "Mark all read"}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-3 w-64" />
            </Card>
          ))}
        </div>
      ) : !notifications.length ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">
            {isBn ? "কোনো নোটিফিকেশন নেই" : "No notifications"}
          </h3>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`transition-colors ${
                !n.read_at ? "bg-primary/5 border-primary/20" : ""
              }`}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.read_at ? "bg-primary" : "bg-transparent"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{getTitle(n)}</p>
                  <p className="text-sm text-muted-foreground">{getMessage(n)}</p>
                  <span className="text-xs text-muted-foreground">
                    {n.created_at && formatRelativeTime(n.created_at)}
                  </span>
                </div>
                {!n.read_at && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={() => handleMarkRead(n.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
