import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "@/constants";
import { notificationsService } from "@/services/notifications";
import type { NotificationResponse } from "@/types/api";
import { dashboardStyles as styles } from "@/components/dashboardStyles";
import { getNotificationIcon, timeAgo } from "@/utils/DashboardUtils";

export function NotificationsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const items = await notificationsService.listMyNotifications(false, 50);
      setNotifications(items);
    } catch (e: any) {
      Alert.alert("Erreur", e?.message ?? "Impossible de charger les notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (visible) {
      load();
    }
  }, [visible]);

  async function handleMarkRead(id: number) {
    try {
      await notificationsService.markNotificationAsRead(id);
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message ?? "Impossible de marquer la notification");
    }
  }

  async function handleMarkAllRead() {
    try {
      await notificationsService.markAllNotificationsAsRead();
      await load();
    } catch (e: any) {
      Alert.alert("Erreur", e?.message ?? "Impossible de tout marquer");
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View
          style={{
            paddingTop: SIZES.xl,
            paddingHorizontal: SIZES.lg,
            paddingBottom: SIZES.md,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: COLORS.text, fontSize: SIZES.fontXl, fontWeight: "800" }}>
            Notifications
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {notifications.length > 0 ? (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            style={{ paddingHorizontal: SIZES.lg, paddingBottom: SIZES.md }}
          >
            <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
              Tout marquer comme lu
            </Text>
          </TouchableOpacity>
        ) : null}

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: SIZES.lg, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await load();
                setRefreshing(false);
              }}
              tintColor={COLORS.primary}
            />
          }
        >
          {loading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: SIZES.xl }} />
          ) : notifications.length === 0 ? (
            <Text style={styles.emptyText}>Aucune notification</Text>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                style={styles.notificationRow}
                onPress={() =>
                  notification.is_read
                    ? undefined
                    : handleMarkRead(notification.id)
                }
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.notificationIconWrap,
                    { backgroundColor: `${COLORS.primary}22` },
                  ]}
                >
                  <Ionicons
                    name={getNotificationIcon(notification.type)}
                    size={16}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.titre}</Text>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.notificationTime}>
                    {timeAgo(notification.created_at)}
                  </Text>
                  {!notification.is_read ? (
                    <Text style={styles.sectionActionLink}>Marquer comme lu</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
