import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getDoctorById,
  DoctorResponse,
  getOnlineDoctors,
} from "../../src/services/DoctorService";
import { getSelectedHospitalId } from "../../src/storage/AuthStorage";
import { subscribeTopic, unsubscribeTopic } from "../../src/services/websocket";
import Toast from "react-native-toast-message";

export default function PatientDoctorProfileScreen() {
  const router = useRouter();
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();

  const [doctor, setDoctor] = useState<DoctorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    let isActive = true;

    const setupPresence = async () => {
      if (!doctorId) return;
      try {
        const initialOnline = await getOnlineDoctors();
        if (isActive) {
          setIsOnline(initialOnline.includes(doctorId));
        }

        const activeHospitalId = await getSelectedHospitalId();
        if (!activeHospitalId) {
          return;
        }

        const presenceTopic = `/topic/hospital/${activeHospitalId}/doctor-presence`;

        await subscribeTopic(presenceTopic, (presenceEvent: any) => {
          if (isActive && presenceEvent && presenceEvent.doctorId === doctorId) {
            setIsOnline(Boolean(presenceEvent.online));
          }
        });
      } catch (err) {
        console.error("Failed to setup real-time presence", err);
      }
    };

    setupPresence();

    return () => {
      isActive = false;
      void getSelectedHospitalId().then((activeHospitalId) => {
        if (activeHospitalId) {
          unsubscribeTopic(`/topic/hospital/${activeHospitalId}/doctor-presence`);
        }
      });
    };
  }, [doctorId]);

  useEffect(() => {
    let isActive = true;
    queueMicrotask(async () => {
      if (!doctorId) {
        if (isActive) {
          setError("Doctor ID is missing.");
          setLoading(false);
        }
        return;
      }

      try {
        if (isActive) setLoading(true);
        const data = await getDoctorById(doctorId);
        if (!isActive) return;
        setDoctor(data);
      } catch (err: any) {
        if (!isActive) return;
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load doctor profile.",
        );
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Unable to fetch doctor details.",
        });
      } finally {
        if (isActive) setLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [doctorId]);

  const handleBook = (type: "ONLINE" | "WALK_IN") => {
    if (doctor) {
      router.push({
        pathname: "/patient/home",
        params: { doctorId: doctor.id, appointmentType: type },
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (error || !doctor) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error || "Doctor not found."}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={21} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.doctorAvatar}>
              <Ionicons name="person" size={40} color="#0F766E" />
            </View>
            <View
              style={[
                styles.onlineDot,
                { backgroundColor: isOnline ? "#10B981" : "#EF4444" },
              ]}
            />
          </View>
          <Text style={styles.nameText}>
            Dr. {doctor.accountName || "Doctor"}
          </Text>
          <Text style={styles.specializationBadge}>
            {doctor.specialization || "Specialization N/A"}
          </Text>

          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDotSmall,
                  { backgroundColor: isOnline ? "#10B981" : "#EF4444" },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isOnline ? "#10B981" : "#EF4444" },
                ]}
              >
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDotSmall,
                  {
                    backgroundColor:
                      doctor.status === "ACTIVE" ? "#10B981" : "#94A3B8",
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: doctor.status === "ACTIVE" ? "#10B981" : "#94A3B8" },
                ]}
              >
                {doctor.status === "ACTIVE" ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>

        {}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          <View style={styles.divider} />
          <DetailRow
            icon="school-outline"
            label="Qualification"
            value={doctor.qualification || "Not available"}
          />
          <DetailRow
            icon="briefcase-outline"
            label="Experience"
            value={`${doctor.experience ?? 0} years`}
          />
          <DetailRow
            icon="medical-outline"
            label="Specialization"
            value={doctor.specialization || "Not available"}
          />
        </View>

        {}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Consultation Information</Text>
          <View style={styles.divider} />
          <DetailRow
            icon="cash-outline"
            label="Consultation Fee"
            value={`₹${doctor.consultationFee ?? 0}`}
          />
        </View>

        {}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Hospital Information</Text>
          <View style={styles.divider} />
          <DetailRow
            icon="business-outline"
            label="Hospital"
            value={doctor.hospitalName || "Not available"}
          />
          <DetailRow
            icon="git-network-outline"
            label="Department"
            value={doctor.departmentName || "Not available"}
          />
        </View>

        {}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleBook("ONLINE")}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.primaryButtonText}>Book Online</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleBook("WALK_IN")}
          >
            <Ionicons
              name="walk-outline"
              size={18}
              color="#0F766E"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.secondaryButtonText}>Book Walk-in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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
      <View style={styles.detailIconContainer}>
        <Ionicons name={icon} size={20} color="#64748B" />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centerContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: { color: "#64748B", fontSize: 14, marginTop: 12 },
  errorText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
  },
  backButtonText: { color: "#0F172A", fontWeight: "600" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerBackButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { color: "#0F172A", fontSize: 18, fontWeight: "800" },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarContainer: { position: "relative", marginBottom: 16 },
  doctorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: "absolute",
    bottom: -4,
    right: -4,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDotSmall: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 14, fontWeight: "600" },
  statusDivider: {
    width: 1,
    height: 14,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 12,
  },

  nameText: {
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  specializationBadge: {
    backgroundColor: "#F0FDF4",
    color: "#16A34A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: "700",
    overflow: "hidden",
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginBottom: 12 },

  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  detailContent: { flex: 1 },
  detailLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  detailValue: { color: "#0F172A", fontSize: 15, fontWeight: "700" },

  actionContainer: { gap: 12, marginTop: 10 },
  primaryButton: {
    flexDirection: "row",
    height: 54,
    borderRadius: 16,
    backgroundColor: "#0F766E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F766E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  secondaryButton: {
    flexDirection: "row",
    height: 54,
    borderRadius: 16,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: { color: "#0F766E", fontSize: 16, fontWeight: "800" },
});
