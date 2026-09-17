import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  NotificationResponse,
} from "../../src/services/NotificationService";
import { subscribeTopic, unsubscribeTopic } from "../../src/services/websocket";
import { getUserSession } from "../../src/storage/AuthStorage";

const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  return d.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getIconForType = (type: string) => {
  switch (type) {
    case "APPOINTMENT_REMINDER":
    case "APPOINTMENT_BOOKED":
    case "APPOINTMENT_UPDATED":
    case "APPOINTMENT_CANCELLED":
      return "calendar-outline";
    case "PRESCRIPTION_ADDED":
      return "medical-outline";
    case "MEDICAL_RECORD_ADDED":
      return "document-text-outline";
    case "CONSENT_REQUEST":
      return "shield-checkmark-outline";
    default:
      return "notifications-outline";
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
          setPage(0);
        } else if (!loadingMore) {
          setLoading(true);
        }

        const currentPage = isRefresh ? 0 : page;
        const response = await getMyNotifications(currentPage, 20);

        const newNotifs = response.content;

        if (isRefresh) {
          setNotifications(newNotifs);
        } else {
          setNotifications((prev) => [...prev, ...newNotifs]);
        }

        setHasMore(!response.last);

        const allList = isRefresh
          ? newNotifs
          : [...notifications, ...newNotifs];
        setUnreadCount(allList.filter((n) => !n.read).length);
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: "Failed to load notifications",
          text2: err?.message || "Please try again.",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [page, notifications, loadingMore],
  );

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (active) {
        await loadNotifications();
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [page, loadNotifications]); 

  useEffect(() => {
    let active = true;

    const setupWs = async () => {
      const session = await getUserSession();
      if (!active || !session?.id) return;

      const notifTopic = `/topic/notifications/${session.id}`;
      try {
        await subscribeTopic(notifTopic, (message: unknown) => {
          if (!active) return;
          const newNotif = message as NotificationResponse;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
          Toast.show({
            type: "info",
            text1: newNotif.title || "New Notification",
            text2: newNotif.message || "",
          });
        });
      } catch (e) {
        console.warn("Notification WS subscription error:", e);
      }
    };

    void setupWs();

    return () => {
      active = false;
      void getUserSession().then((session) => {
        if (session?.id) {
          unsubscribeTopic(`/topic/notifications/${session.id}`);
        }
      });
    };
  }, []);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading && !refreshing) {
      setLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      Toast.show({ type: "error", text1: "Failed to mark as read" });
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      Toast.show({
        type: "success",
        text1: "All notifications marked as read",
      });
    } catch {
      Toast.show({ type: "error", text1: "Failed to update notifications" });
    }
  };

  const renderItem = ({ item }: { item: NotificationResponse }) => {
    const isUnread = !item.read;

    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.cardUnread]}
        onPress={() => {
          if (isUnread) handleMarkAsRead(item.id);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <LinearGradient
            colors={isUnread ? ["#6C63FF", "#8B5CF6"] : ["#2D2550", "#2D2550"]}
            style={styles.iconContainer}
          >
            <Ionicons
              name={getIconForType(item.type) as any}
              size={20}
              color={isUnread ? "#fff" : "#9CA3AF"}
            />
          </LinearGradient>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text
              style={[styles.title, isUnread && styles.titleUnread]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={styles.timeText}>
              {formatDateTime(item.createdAt)}
            </Text>
          </View>

          <Text style={[styles.message, isUnread && styles.messageUnread]}>
            {item.message}
          </Text>
        </View>

        {isUnread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0A1E" />

      {}
      <LinearGradient
        colors={["#0F0A1E", "#1A1040"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} unread</Text>
          )}
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            style={styles.markAllBtn}
          >
            <Ionicons name="checkmark-done" size={20} color="#6C63FF" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 38 }} /> 
        )}
      </LinearGradient>

      {}
      {loading && page === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Loading notifications…</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color="#4B5563"
            />
          </View>
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptySubtitle}>
            You&apos;re all caught up! New updates regarding your appointments and
            records will appear here.
          </Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => loadNotifications(true)}
          >
            <Ionicons name="refresh" size={16} color="#6C63FF" />
            <Text style={styles.refreshBtnText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadNotifications(true)}
              tintColor="#6C63FF"
              colors={["#6C63FF"]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color="#6C63FF"
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
        />
      )}

      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0F0A1E",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  headerSub: {
    fontSize: 12,
    color: "#A78BFA",
    marginTop: 1,
  },
  markAllBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(108,99,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 8,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(75,85,99,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E5E7EB",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "rgba(108,99,255,0.12)",
    borderWidth: 1,
    borderColor: "#6C63FF44",
  },
  refreshBtnText: {
    color: "#6C63FF",
    fontSize: 14,
    fontWeight: "600",
  },

  listContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#1C1535",
    borderRadius: 16,
    padding: 16,
    paddingRight: 12, 
    gap: 12,
    borderWidth: 1,
    borderColor: "#2D2550",
  },
  cardUnread: {
    backgroundColor: "rgba(108,99,255,0.06)",
    borderColor: "rgba(108,99,255,0.3)",
  },
  cardLeft: {
    paddingTop: 2,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#D1D5DB",
  },
  titleUnread: {
    fontWeight: "700",
    color: "#F3F4F6",
  },
  timeText: {
    fontSize: 11,
    color: "#6B7280",
  },
  message: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  messageUnread: {
    color: "#D1D5DB",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6C63FF",
    alignSelf: "center",
    marginLeft: 4,
  },
});
