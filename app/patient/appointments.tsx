import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Modal,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import { getMyPatientProfile } from "../../src/services/PatientService";
import {
  getAppointmentsByPatient,
  deleteAppointment,
  updateAppointment,
  AppointmentResponse,
} from "../../src/services/AppointmentService";
import { getSelectedHospitalId } from "../../src/storage/AuthStorage";
import {
  subscribeQueueTopic,
  unsubscribeQueueTopic,
} from "../../src/services/websocket";

type TabKey = "UPCOMING" | "COMPLETED" | "CANCELLED";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "UPCOMING", label: "Upcoming", icon: "calendar-outline" },
  { key: "COMPLETED", label: "Completed", icon: "checkmark-circle-outline" },
  { key: "CANCELLED", label: "Cancelled", icon: "close-circle-outline" },
];

const UPCOMING_STATUSES = new Set(["SCHEDULED", "CHECKED_IN"]);

export default function PatientAppointmentsScreen() {
  const router = useRouter();

  const [, setPatientId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<TabKey>("UPCOMING");
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [detailAppt, setDetailAppt] = useState<AppointmentResponse | null>(
    null,
  );

  const [rescheduleAppt, setRescheduleAppt] =
    useState<AppointmentResponse | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [rescheduleTime, setRescheduleTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  const loadAppointments = useCallback(async (isActive: boolean = true) => {
    try {
      setLoading(true);
      setError("");
      
      const profile = await getMyPatientProfile();
      if (!isActive) return;
      setPatientId(profile.id);
      const data = await getAppointmentsByPatient(profile.id);
      if (!isActive) return;
      
      const owned = data.filter(
        (a) => !a.patientId || a.patientId === profile.id,
      );
      setAppointments(owned);
    } catch (err: any) {
      if (!isActive) return;
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load appointments.",
      );
    } finally {
      if (isActive) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;
    queueMicrotask(() => {
      void loadAppointments(isActive);
    });
    return () => {
      isActive = false;
    };
  }, [loadAppointments]);

  useEffect(() => {
    let isSubscribed = true;

    const setupQueueSubscription = async () => {
      const hospitalId = await getSelectedHospitalId();
      if (!hospitalId || !isSubscribed) return;

      try {
        await subscribeQueueTopic(hospitalId, () => {
          if (isSubscribed) {
            void loadAppointments(true);
          }
        });
      } catch {
        
      }
    };

    void setupQueueSubscription();

    return () => {
      isSubscribed = false;
      getSelectedHospitalId().then((hId) => {
        if (hId) unsubscribeQueueTopic(hId);
      });
    };
  }, [loadAppointments]);

  const filtered = [...appointments]
    .filter((a) => {
      const s = a.appointmentStatus ?? "";
      if (activeTab === "UPCOMING") return UPCOMING_STATUSES.has(s);
      if (activeTab === "COMPLETED") return s === "COMPLETED";
      if (activeTab === "CANCELLED") return s === "CANCELLED";
      return false;
    })
    .sort((a, b) => {
      const aStr = `${a.appointmentDate ?? ""} ${a.appointmentTime ?? ""}`;
      const bStr = `${b.appointmentDate ?? ""} ${b.appointmentTime ?? ""}`;
      
      return activeTab === "UPCOMING"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

  const handleCancel = async (id: string) => {
    try {
      setCancellingId(id);
      await deleteAppointment(id);
      Toast.show({ type: "success", text1: "Appointment Cancelled" });
      setDetailAppt(null);
      await loadAppointments();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Cancel Failed",
        text2: err?.response?.data?.message || err?.message,
      });
    } finally {
      setCancellingId(null);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleAppt || !rescheduleDate || !rescheduleTime) {
      Toast.show({ type: "error", text1: "Please select both date and time." });
      return;
    }
    try {
      setRescheduling(true);
      const dateStr = `${rescheduleDate.getFullYear()}-${String(rescheduleDate.getMonth() + 1).padStart(2, "0")}-${String(rescheduleDate.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(rescheduleTime.getHours()).padStart(2, "0")}:${String(rescheduleTime.getMinutes()).padStart(2, "0")}`;

      await updateAppointment(rescheduleAppt.id, {
        hospitalId: rescheduleAppt.hospitalId,
        departmentId: rescheduleAppt.departmentId,
        doctorId: rescheduleAppt.doctorId,
        patientId: rescheduleAppt.patientId,
        appointmentType: rescheduleAppt.appointmentType,
        consultationMode: rescheduleAppt.consultationMode,
        remarks: rescheduleAppt.remarks,
        appointmentDate: dateStr,
        appointmentTime: timeStr,
      });

      Toast.show({
        type: "success",
        text1: "Appointment Rescheduled",
        text2: `New: ${dateStr} at ${timeStr}`,
      });
      setRescheduleAppt(null);
      setRescheduleDate(null);
      setRescheduleTime(null);
      await loadAppointments();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Reschedule failed.";
      Toast.show({ type: "error", text1: "Reschedule Failed", text2: msg });
    } finally {
      setRescheduling(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={styles.loadingText}>Loading appointments...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => loadAppointments()}
        >
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.badge}>PATIENT PORTAL</Text>
          <Text style={styles.title}>My Appointments</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={() => loadAppointments()}
        >
          <Ionicons name="refresh" size={20} color="#0F766E" />
        </TouchableOpacity>
      </View>

      {}
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const count = appointments.filter((a) => {
            const s = a.appointmentStatus ?? "";
            if (tab.key === "UPCOMING") return UPCOMING_STATUSES.has(s);
            if (tab.key === "COMPLETED") return s === "COMPLETED";
            if (tab.key === "CANCELLED") return s === "CANCELLED";
            return false;
          }).length;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.key && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    activeTab === tab.key && styles.tabBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      activeTab === tab.key && styles.tabBadgeTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {}
      <FlatList
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item: appt }) => (
          <AppointmentCard
            appt={appt}
            cancellingId={cancellingId}
            onViewDetails={() => setDetailAppt(appt)}
            onCancel={() => handleCancel(appt.id)}
            onReschedule={() => {
              setRescheduleAppt(appt);
              setRescheduleDate(null);
              setRescheduleTime(null);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons
              name={
                activeTab === "UPCOMING"
                  ? "calendar-outline"
                  : activeTab === "COMPLETED"
                    ? "checkmark-circle-outline"
                    : "close-circle-outline"
              }
              size={44}
              color="#CBD5E1"
            />
            <Text style={styles.emptyTitle}>
              No {activeTab.charAt(0) + activeTab.slice(1).toLowerCase()}{" "}
              appointments
            </Text>
            {activeTab === "UPCOMING" && (
              <TouchableOpacity
                style={styles.bookNowBtn}
                onPress={() => router.push("/patient/doctors")}
              >
                <Text style={styles.bookNowBtnText}>Find a Doctor</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {}
      <Modal
        visible={Boolean(detailAppt)}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailAppt(null)}
      >
        {detailAppt && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandleBar} />
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Appointment Details</Text>
                <TouchableOpacity onPress={() => setDetailAppt(null)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {}
                <View
                  style={[
                    styles.statusBanner,
                    getStatusBannerStyle(detailAppt.appointmentStatus),
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBannerText,
                      getStatusTextStyle(detailAppt.appointmentStatus),
                    ]}
                  >
                    {getStatusLabel(detailAppt.appointmentStatus)}
                  </Text>
                </View>

                {}
                {detailAppt.tokenNumber ? (
                  <View
                    style={[
                      styles.onlineNotice,
                      {
                        backgroundColor: "#F0FDF4",
                        borderColor: "#BBF7D0",
                        marginTop: 12,
                      },
                    ]}
                  >
                    <Ionicons name="people-outline" size={24} color="#16A34A" />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.onlineNoticeTitle, { color: "#16A34A" }]}
                      >
                        Token: {detailAppt.tokenNumber} | Queue: #
                        {detailAppt.queueNumber}
                      </Text>
                      <Text
                        style={[styles.onlineNoticeBody, { color: "#15803D" }]}
                      >
                        Queue Status:{" "}
                        <Text style={{ fontWeight: "bold" }}>
                          {detailAppt.queueStatus}
                        </Text>
                      </Text>
                    </View>
                  </View>
                ) : null}

                {}
                <DetailSection title="Doctor">
                  <DetailRow
                    icon="person-outline"
                    label="Name"
                    value={`Dr. ${detailAppt.doctorName || "—"}`}
                  />
                  <DetailRow
                    icon="medical-outline"
                    label="Specialization"
                    value={detailAppt.doctorSpecialization || "—"}
                  />
                </DetailSection>

                <DetailSection title="Location">
                  <DetailRow
                    icon="business-outline"
                    label="Hospital"
                    value={detailAppt.hospitalName || "—"}
                  />
                  <DetailRow
                    icon="git-network-outline"
                    label="Department"
                    value={detailAppt.departmentName || "—"}
                  />
                </DetailSection>

                <DetailSection title="Schedule">
                  <DetailRow
                    icon="calendar-outline"
                    label="Date"
                    value={detailAppt.appointmentDate || "—"}
                  />
                  <DetailRow
                    icon="time-outline"
                    label="Time"
                    value={detailAppt.appointmentTime || "—"}
                  />
                  <DetailRow
                    icon={
                      detailAppt.appointmentType === "ONLINE"
                        ? "globe-outline"
                        : "walk-outline"
                    }
                    label="Type"
                    value={
                      detailAppt.appointmentType === "ONLINE"
                        ? "Online Consultation"
                        : detailAppt.appointmentType === "WALK_IN"
                          ? "Walk-in Visit"
                          : detailAppt.appointmentType || "—"
                    }
                  />
                  <DetailRow
                    icon="pulse-outline"
                    label="Mode"
                    value={
                      detailAppt.consultationMode === "VIDEO"
                        ? "Video Consultation"
                        : detailAppt.consultationMode === "OPD"
                          ? "Out-Patient (OPD)"
                          : detailAppt.consultationMode || "—"
                    }
                  />
                  <DetailRow
                    icon="cash-outline"
                    label="Fee"
                    value={
                      detailAppt.consultationFee !== undefined &&
                      detailAppt.consultationFee !== null
                        ? `$${detailAppt.consultationFee.toFixed(2)}`
                        : "—"
                    }
                  />
                  {detailAppt.appointmentNumber ? (
                    <DetailRow
                      icon="barcode-outline"
                      label="Appointment #"
                      value={detailAppt.appointmentNumber}
                    />
                  ) : null}
                  <DetailRow
                    icon="add-circle-outline"
                    label="Created On"
                    value={
                      detailAppt.createdAt
                        ? new Date(detailAppt.createdAt).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "—"
                    }
                  />
                </DetailSection>

                {detailAppt.remarks ? (
                  <DetailSection title="Reason for Visit">
                    <Text style={styles.remarksBody}>{detailAppt.remarks}</Text>
                  </DetailSection>
                ) : null}

                {}
                {detailAppt.appointmentType === "ONLINE" &&
                  UPCOMING_STATUSES.has(detailAppt.appointmentStatus ?? "") && (
                    <View style={styles.onlineNotice}>
                      <Ionicons
                        name="globe-outline"
                        size={18}
                        color="#0F766E"
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.onlineNoticeTitle}>
                          Online Consultation
                        </Text>
                        <Text style={styles.onlineNoticeBody}>
                          Your doctor will connect with you at the scheduled
                          time. Please be available and reachable.
                        </Text>
                      </View>
                    </View>
                  )}

                {}
                {UPCOMING_STATUSES.has(detailAppt.appointmentStatus ?? "") && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.rescheduleModalBtn}
                      onPress={() => {
                        setDetailAppt(null);
                        setRescheduleAppt(detailAppt);
                        setRescheduleDate(null);
                        setRescheduleTime(null);
                      }}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color="#0F766E"
                      />
                      <Text style={styles.rescheduleModalBtnText}>
                        Reschedule
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelModalBtn}
                      onPress={() => handleCancel(detailAppt.id)}
                      disabled={cancellingId === detailAppt.id}
                    >
                      {cancellingId === detailAppt.id ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <>
                          <Ionicons
                            name="close-circle-outline"
                            size={16}
                            color="#EF4444"
                          />
                          <Text style={styles.cancelModalBtnText}>Cancel</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>

      {}
      <Modal
        visible={Boolean(rescheduleAppt)}
        transparent
        animationType="slide"
        onRequestClose={() => setRescheduleAppt(null)}
      >
        {rescheduleAppt && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandleBar} />
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Reschedule</Text>
                <TouchableOpacity onPress={() => setRescheduleAppt(null)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.rescheduleDoctor}>
                Dr. {rescheduleAppt.doctorName}
              </Text>
              <Text style={styles.rescheduleCurrentDate}>
                Current: {rescheduleAppt.appointmentDate} at{" "}
                {rescheduleAppt.appointmentTime}
              </Text>

              {}
              <Text style={styles.pickerLabel}>New Date *</Text>
              {Platform.OS === "web" ? (
                <View style={styles.pickerBox}>
                  <input
                    type="date"
                    min={todayStr}
                    value={
                      rescheduleDate
                        ? `${rescheduleDate.getFullYear()}-${String(rescheduleDate.getMonth() + 1).padStart(2, "0")}-${String(rescheduleDate.getDate()).padStart(2, "0")}`
                        : ""
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) {
                        const [y, m, d] = v.split("-").map(Number);
                        setRescheduleDate(new Date(y, m - 1, d));
                      }
                    }}
                    style={
                      {
                        height: 50,
                        width: "100%",
                        border: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                        paddingLeft: 16,
                        fontSize: 14,
                        color: rescheduleDate ? "#0F172A" : "#94A3B8",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      } as any
                    }
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.pickerBox}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={{
                      color: rescheduleDate ? "#0F172A" : "#94A3B8",
                      fontSize: 14,
                      paddingLeft: 4,
                    }}
                  >
                    📅{" "}
                    {rescheduleDate
                      ? rescheduleDate.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "Select Date"}
                  </Text>
                </TouchableOpacity>
              )}
              {showDatePicker && Platform.OS !== "web" && (
                <DateTimePicker
                  value={rescheduleDate || new Date()}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={(e, d) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (d) setRescheduleDate(d);
                  }}
                />
              )}

              {}
              <Text style={[styles.pickerLabel, { marginTop: 14 }]}>
                New Time *
              </Text>
              {Platform.OS === "web" ? (
                <View style={styles.pickerBox}>
                  <input
                    type="time"
                    value={
                      rescheduleTime
                        ? `${String(rescheduleTime.getHours()).padStart(2, "0")}:${String(rescheduleTime.getMinutes()).padStart(2, "0")}`
                        : ""
                    }
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) {
                        const [h, m] = v.split(":").map(Number);
                        const d = new Date();
                        d.setHours(h, m, 0, 0);
                        setRescheduleTime(d);
                      }
                    }}
                    style={
                      {
                        height: 50,
                        width: "100%",
                        border: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                        paddingLeft: 16,
                        fontSize: 14,
                        color: rescheduleTime ? "#0F172A" : "#94A3B8",
                        cursor: "pointer",
                        boxSizing: "border-box",
                      } as any
                    }
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.pickerBox}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text
                    style={{
                      color: rescheduleTime ? "#0F172A" : "#94A3B8",
                      fontSize: 14,
                      paddingLeft: 4,
                    }}
                  >
                    🕐{" "}
                    {rescheduleTime
                      ? rescheduleTime.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Select Time"}
                  </Text>
                </TouchableOpacity>
              )}
              {showTimePicker && Platform.OS !== "web" && (
                <DateTimePicker
                  value={rescheduleTime || new Date()}
                  mode="time"
                  is24Hour={false}
                  onChange={(e, t) => {
                    setShowTimePicker(Platform.OS === "ios");
                    if (t) setRescheduleTime(t);
                  }}
                />
              )}

              <View style={styles.rescheduleActions}>
                <TouchableOpacity
                  style={styles.rescheduleCancelBtn}
                  onPress={() => setRescheduleAppt(null)}
                >
                  <Text style={styles.rescheduleCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rescheduleConfirmBtn}
                  onPress={handleReschedule}
                  disabled={rescheduling}
                >
                  {rescheduling ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.rescheduleConfirmText}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

function AppointmentCard({
  appt,
  cancellingId,
  onViewDetails,
  onCancel,
  onReschedule,
}: {
  appt: AppointmentResponse;
  cancellingId: string | null;
  onViewDetails: () => void;
  onCancel: () => void;
  onReschedule: () => void;
}) {
  const isActive = UPCOMING_STATUSES.has(appt.appointmentStatus ?? "");
  return (
    <View style={styles.card}>
      {}
      <View style={styles.cardHeader}>
        <View style={styles.cardAvatarRing}>
          <Ionicons name="person" size={20} color="#0F766E" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardDoctor}>Dr. {appt.doctorName || "—"}</Text>
          <Text style={styles.cardHospital} numberOfLines={1}>
            {appt.hospitalName || "—"}
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            getStatusPillStyle(appt.appointmentStatus),
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              getStatusPillTextStyle(appt.appointmentStatus),
            ]}
          >
            {appt.appointmentStatus}
          </Text>
        </View>
      </View>

      {}
      <View style={styles.cardRow}>
        <Ionicons name="git-network-outline" size={13} color="#94A3B8" />
        <Text style={styles.cardMeta}>{appt.departmentName || "—"}</Text>
        {appt.appointmentType === "ONLINE" ? (
          <View style={styles.typeBadgeOnline}>
            <Text style={styles.typeBadgeOnlineText}>🌐 Online</Text>
          </View>
        ) : appt.appointmentType === "WALK_IN" ? (
          <View style={styles.typeBadgeWalkin}>
            <Text style={styles.typeBadgeWalkinText}>🚶 Walk-in</Text>
          </View>
        ) : null}
      </View>

      {}
      <View style={styles.cardRow}>
        <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
        <Text style={styles.cardMeta}>{appt.appointmentDate || "—"}</Text>
        <Ionicons
          name="time-outline"
          size={13}
          color="#94A3B8"
          style={{ marginLeft: 10 }}
        />
        <Text style={styles.cardMeta}>{appt.appointmentTime || "—"}</Text>
      </View>

      {}
      {appt.remarks ? (
        <Text style={styles.cardRemarks} numberOfLines={2}>
          📝 {appt.remarks}
        </Text>
      ) : null}

      {}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.viewBtn} onPress={onViewDetails}>
          <Text style={styles.viewBtnText}>View Details</Text>
        </TouchableOpacity>
        {isActive && (
          <>
            <TouchableOpacity
              style={styles.rescheduleBtn}
              onPress={onReschedule}
            >
              <Ionicons name="calendar-outline" size={14} color="#0F766E" />
              <Text style={styles.rescheduleBtnText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onCancel}
              disabled={cancellingId === appt.id}
            >
              {cancellingId === appt.id ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Text style={styles.cancelBtnText}>Cancel</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.detailSection}>
      <Text style={styles.detailSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color="#64748B" style={{ width: 22 }} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function getStatusLabel(s?: string) {
  switch (s) {
    case "SCHEDULED":
      return "⏳ Scheduled";
    case "CHECKED_IN":
      return "✅ Checked In";
    case "COMPLETED":
      return "✔ Completed";
    case "CANCELLED":
      return "✕ Cancelled";
    default:
      return s || "Unknown";
  }
}

function getStatusPillStyle(s?: string): object {
  switch (s) {
    case "SCHEDULED":
      return { backgroundColor: "#DBEAFE" };
    case "CHECKED_IN":
      return { backgroundColor: "#D1FAE5" };
    case "COMPLETED":
      return { backgroundColor: "#F0FDF4" };
    case "CANCELLED":
      return { backgroundColor: "#FEE2E2" };
    default:
      return { backgroundColor: "#F1F5F9" };
  }
}
function getStatusPillTextStyle(s?: string): object {
  switch (s) {
    case "SCHEDULED":
      return { color: "#1D4ED8" };
    case "CHECKED_IN":
      return { color: "#065F46" };
    case "COMPLETED":
      return { color: "#15803D" };
    case "CANCELLED":
      return { color: "#DC2626" };
    default:
      return { color: "#64748B" };
  }
}
function getStatusBannerStyle(s?: string): object {
  switch (s) {
    case "SCHEDULED":
      return { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" };
    case "CHECKED_IN":
      return { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" };
    case "COMPLETED":
      return { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" };
    case "CANCELLED":
      return { backgroundColor: "#FEF2F2", borderColor: "#FECACA" };
    default:
      return { backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" };
  }
}
function getStatusTextStyle(s?: string): object {
  switch (s) {
    case "SCHEDULED":
      return { color: "#1D4ED8" };
    case "CHECKED_IN":
      return { color: "#065F46" };
    case "COMPLETED":
      return { color: "#15803D" };
    case "CANCELLED":
      return { color: "#DC2626" };
    default:
      return { color: "#64748B" };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  center: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { color: "#64748B", fontSize: 14, marginTop: 12 },
  errorText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#0F766E",
    borderRadius: 10,
  },
  retryBtnText: { color: "#FFF", fontWeight: "700" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    color: "#0F766E",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: { color: "#0F172A", fontSize: 22, fontWeight: "800", marginTop: 2 },

  tabRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: "#0F766E" },
  tabLabel: { fontSize: 13, fontWeight: "700", color: "#94A3B8" },
  tabLabelActive: { color: "#0F766E" },
  tabBadge: {
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeActive: { backgroundColor: "#CCFBF1" },
  tabBadgeText: { fontSize: 11, fontWeight: "700", color: "#64748B" },
  tabBadgeTextActive: { color: "#0F766E" },

  list: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 680,
    width: "100%",
    alignSelf: "center",
  },
  emptyCard: { alignItems: "center", padding: 40 },
  emptyTitle: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
  },
  bookNowBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#0F766E",
    borderRadius: 12,
  },
  bookNowBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  cardAvatarRing: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
  },
  cardDoctor: { color: "#0F172A", fontSize: 16, fontWeight: "800" },
  cardHospital: { color: "#64748B", fontSize: 12, marginTop: 2 },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  cardMeta: { color: "#64748B", fontSize: 12, fontWeight: "600" },
  cardRemarks: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 6,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap",
  },
  viewBtn: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    minWidth: 90,
  },
  viewBtnText: { color: "#475569", fontWeight: "700", fontSize: 13 },
  rescheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
  },
  rescheduleBtnText: { color: "#0F766E", fontWeight: "700", fontSize: 13 },
  cancelBtn: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: { color: "#EF4444", fontWeight: "700", fontSize: 13 },

  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusPillText: { fontSize: 11, fontWeight: "800" },

  typeBadgeOnline: {
    backgroundColor: "#DBEAFE",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 4,
  },
  typeBadgeOnlineText: { color: "#1D4ED8", fontSize: 11, fontWeight: "700" },
  typeBadgeWalkin: {
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 4,
  },
  typeBadgeWalkinText: { color: "#065F46", fontSize: 11, fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "88%",
    paddingBottom: 40,
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 18,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A" },

  statusBanner: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 16,
  },
  statusBannerText: { fontSize: 15, fontWeight: "800" },

  detailSection: { marginBottom: 16 },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#94A3B8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  detailLabel: {
    flex: 1,
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
  },
  detailValue: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
    maxWidth: "55%",
    textAlign: "right",
  },
  remarksBody: { color: "#475569", fontSize: 14, lineHeight: 22 },

  modalActions: { flexDirection: "row", gap: 12, marginTop: 20 },
  rescheduleModalBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  rescheduleModalBtnText: { color: "#0F766E", fontWeight: "800", fontSize: 14 },
  cancelModalBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  cancelModalBtnText: { color: "#EF4444", fontWeight: "800", fontSize: 14 },

  rescheduleDoctor: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  rescheduleCurrentDate: { color: "#64748B", fontSize: 13, marginBottom: 20 },
  pickerLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  pickerBox: {
    height: 50,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    overflow: "hidden",
  },
  rescheduleActions: { flexDirection: "row", gap: 12, marginTop: 24 },
  rescheduleCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  rescheduleCancelText: { color: "#475569", fontWeight: "700" },
  rescheduleConfirmBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
  },
  rescheduleConfirmText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  onlineNotice: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    backgroundColor: "#CCFBF1",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#99F6E4",
  },
  onlineNoticeTitle: {
    color: "#0F766E",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
  onlineNoticeBody: { color: "#065F46", fontSize: 12, lineHeight: 18 },
});
