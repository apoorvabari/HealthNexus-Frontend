import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar, ActivityIndicator,
  RefreshControl, TextInput
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import { getUserSession } from "../../src/storage/AuthStorage";
import { getAllDoctors, DoctorResponse, createDoctorProfile } from "../../src/services/DoctorService";
import { getAllHospitals, HospitalResponse } from "../../src/services/HospitalService";
import { getDepartmentsByHospital, DepartmentResponse } from "../../src/services/DepartmentService";
import CustomInput from "../../src/components/inputs/CustomInput";
import PrimaryButton from "../../src/components/buttons/PrimaryButton";
import {
  getTodayQueueByDoctor,
  callNextPatient,
  startConsultation,
  completeConsultation,
  skipQueuePatient,
  QueueResponse,
} from "../../src/services/QueueService";

export default function DoctorHomeScreen() {
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState<any>(null);
  const [profile, setProfile] = useState<DoctorResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [queue, setQueue] = useState<QueueResponse[]>([]);

  const [needsProfile, setNeedsProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const handleLogout = () => {
    router.push("/logout?role=doctor");
  };

  const loadData = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) setLoading(true);
      const session = await getUserSession();
      setSessionUser(session);

      if (session?.email) {
        const doctorList = await getAllDoctors();
        const foundProfile = doctorList.find(d => d.accountId === session.id);
        if (foundProfile) {
          setProfile(foundProfile);
          const doctorQueue = await getTodayQueueByDoctor(foundProfile.id);
          setQueue(doctorQueue);
          setNeedsProfile(false);
        } else {
          setNeedsProfile(true);
          const data = await getAllHospitals();
          setHospitals(data);
          if (data.length > 0) {
            setSelectedHospitalId(data[0].id);
          }
        }
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error loading dashboard",
        text2: err?.message || "Failed to fetch consultation queue",
      });
    } finally {
      if (showLoadingIndicator) setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const fetchDepts = async () => {
      if (selectedHospitalId) {
        try {
          const depts = await getDepartmentsByHospital(selectedHospitalId);
          setDepartments(depts);
          if (depts.length > 0) {
            setSelectedDepartmentId(depts[0].id);
          } else {
            setSelectedDepartmentId("");
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchDepts();
  }, [selectedHospitalId]);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      if (!selectedHospitalId || !selectedDepartmentId || !specialization || !qualification || !experience || !consultationFee || !licenseNumber) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please fill all required fields." });
        return;
      }
      await createDoctorProfile({
        accountId: sessionUser.id,
        hospitalId: selectedHospitalId || undefined,
        departmentId: selectedDepartmentId || undefined,
        specialization: specialization.trim(),
        qualification: qualification.trim(),
        experience: parseInt(experience, 10),
        consultationFee: parseFloat(consultationFee),
        licenseNumber: licenseNumber.trim(),
      });
      Toast.show({ type: "success", text1: "Profile Completed!" });
      loadData();
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error Saving Profile", text2: err?.message || "Please try again." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCallNext = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const res = await callNextPatient(profile.id);
      Toast.show({
        type: "success",
        text1: "Patient Called",
        text2: res.message || `Token ${res.tokenNumber} is called.`,
      });
      await loadData(false);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Unable to Call Next",
        text2: err?.response?.data?.message || err?.message || "No waiting patients.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartConsultation = async (queueId: string) => {
    try {
      setLoading(true);
      const res = await startConsultation(queueId);
      Toast.show({
        type: "success",
        text1: "Consultation Started",
        text2: res.message || "Consultation in progress.",
      });
      await loadData(false);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error Starting Consultation",
        text2: err?.response?.data?.message || err?.message || "Operation failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteConsultation = async (queueId: string) => {
    try {
      setLoading(true);
      const res = await completeConsultation(queueId);
      Toast.show({
        type: "success",
        text1: "Consultation Completed",
        text2: res.message || "Patient marked as completed.",
      });
      await loadData(false);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error Completing",
        text2: err?.response?.data?.message || err?.message || "Operation failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPatient = async (queueId: string) => {
    try {
      setLoading(true);
      const res = await skipQueuePatient(queueId);
      Toast.show({
        type: "info",
        text1: "Patient Skipped",
        text2: res.message || "Patient token skipped.",
      });
      await loadData(false);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error Skipping",
        text2: err?.response?.data?.message || err?.message || "Operation failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWaitingCount = () => queue.filter(q => q.queueStatus === "WAITING").length;
  const getInConsultationCount = () => queue.filter(q => q.queueStatus === "IN_CONSULTATION").length;
  const getCompletedCount = () => queue.filter(q => q.queueStatus === "COMPLETED").length;

  const activeConsultation = queue.find(q => q.queueStatus === "IN_CONSULTATION");
  const calledPatient = queue.find(q => q.queueStatus === "CALLED");

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LinearGradient
        colors={["#F8FAFC", "#F1F5F9", "#E2E8F0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.portalBadge}>👨‍⚕️ DOCTOR CONSOLE</Text>
              <Text style={styles.welcomeTitle}>
                {profile ? `Dr. ${profile.accountName}` : "Doctor Workspace 👋"}
              </Text>
              <Text style={styles.userEmail}>{sessionUser?.email || "doctor@healthnexus.com"}</Text>
              {profile && (
                <View style={styles.profileMeta}>
                  <Text style={styles.metaText}>{profile.specialization || "General Medicine"}</Text>
                  <Text style={styles.metaText}>Dept: {profile.departmentName || "General"}</Text>
                  <Text style={styles.metaText}>Lic: {profile.licenseNumber || "N/A"}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={16} color="#38BDF8" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {needsProfile ? (
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Complete Your Profile</Text>
              <Text style={[styles.emptyText, { marginBottom: 16 }]}>Please fill in your professional details to proceed.</Text>
              
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.fieldLabel}>Select Hospital *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker selectedValue={selectedHospitalId} onValueChange={setSelectedHospitalId} dropdownIconColor="#64748B" style={{ color: "#0F172A", height: 50, borderWidth: 0, backgroundColor: "transparent", outlineStyle: 'none' } as any}>
                    <Picker.Item label="-- Select Hospital --" value="" color="#64748B" />
                    {hospitals.map(h => <Picker.Item key={h.id} label={h.hospitalName} value={h.id} color="#0F172A" />)}
                  </Picker>
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={styles.fieldLabel}>Select Department *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker selectedValue={selectedDepartmentId} onValueChange={setSelectedDepartmentId} dropdownIconColor="#64748B" style={{ color: "#0F172A", height: 50, borderWidth: 0, backgroundColor: "transparent", outlineStyle: 'none' } as any}>
                    <Picker.Item label="-- Select Department --" value="" color="#64748B" />
                    {departments.map(d => <Picker.Item key={d.id} label={d.departmentName} value={d.id} color="#0F172A" />)}
                  </Picker>
                </View>
              </View>

              <CustomInput label="Specialization *" placeholder="e.g. Cardiologist" value={specialization} onChangeText={setSpecialization} darkTheme={true} />
              <CustomInput label="Qualification *" placeholder="e.g. MD, MBBS" value={qualification} onChangeText={setQualification} darkTheme={true} />
              <CustomInput label="Experience (Years) *" placeholder="e.g. 5" value={experience} onChangeText={setExperience} keyboardType="numeric" maxLength={2} darkTheme={true} />
              <CustomInput label="Consultation Fee ($) *" placeholder="e.g. 50" value={consultationFee} onChangeText={setConsultationFee} keyboardType="numeric" darkTheme={true} />
              <CustomInput label="License Number *" placeholder="Enter Medical License" value={licenseNumber} onChangeText={setLicenseNumber} maxLength={30} darkTheme={true} />
              
              <PrimaryButton title="Save Profile" onPress={handleSaveProfile} loading={savingProfile} style={{ marginTop: 20, backgroundColor: "#38BDF8" }} />
            </View>
          ) : (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{getWaitingCount()}</Text>
                  <Text style={styles.statLabel}>Waiting Patients</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{getInConsultationCount()}</Text>
                  <Text style={styles.statLabel}>In Consultation</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{getCompletedCount()}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Active Consultation Desk</Text>

                {activeConsultation ? (
                  <View style={styles.activeConsultationBox}>
                    <View style={styles.patientIndicatorRow}>
                      <View style={styles.pulseDot} />
                      <Text style={styles.activePatientTitle}>CONSULTATION IN PROGRESS</Text>
                    </View>
                    <Text style={styles.activeToken}>{activeConsultation.tokenNumber}</Text>
                    <Text style={styles.activePatientLabel}>Appointment Reference</Text>
                    <Text style={styles.activePatientCode}>{activeConsultation.appointmentNumber}</Text>

                    <TouchableOpacity
                      style={[styles.primaryActionBtn, styles.completeBtn]}
                      onPress={() => handleCompleteConsultation(activeConsultation.id)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.primaryActionBtnText}>✅ Complete Consultation</Text>
                    </TouchableOpacity>
                  </View>
                ) : calledPatient ? (
                  <View style={styles.activeCalledBox}>
                    <View style={styles.patientIndicatorRow}>
                      <Text style={styles.activePatientTitle}>PATIENT CALLED TO DESK</Text>
                    </View>
                    <Text style={[styles.activeToken, { color: "#38BDF8" }]}>{calledPatient.tokenNumber}</Text>
                    <Text style={styles.activePatientLabel}>Appointment Reference</Text>
                    <Text style={styles.activePatientCode}>{calledPatient.appointmentNumber}</Text>

                    <View style={styles.calledActionRow}>
                      <TouchableOpacity
                        style={[styles.halfActionBtn, styles.startBtn]}
                        onPress={() => handleStartConsultation(calledPatient.id)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.primaryActionBtnText}>🩺 Start</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.halfActionBtn, styles.skipBtn]}
                        onPress={() => handleSkipPatient(calledPatient.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.skipBtnText}>⏭️ Skip</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.emptyActionBox}>
                    <Text style={styles.emptyActionText}>No patient is currently called or in consultation.</Text>
                    <TouchableOpacity style={styles.callNextBtn} onPress={handleCallNext} activeOpacity={0.85}>
                      <Text style={styles.callNextBtnText}>📢 Call Next Patient</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.queueHeaderRow}>
                <Text style={styles.sectionTitle}>Today{"'"}s Queue List</Text>
                <TouchableOpacity style={styles.refreshLink} onPress={onRefresh} activeOpacity={0.8}>
                  <Text style={styles.refreshLinkText}>🔄 Refresh</Text>
                </TouchableOpacity>
              </View>

              {queue.length === 0 ? (
                <View style={styles.emptyQueueCard}>
                  <Text style={styles.emptyQueueText}>No patient tokens generated for today yet.</Text>
                </View>
              ) : (
                <View style={styles.queueList}>
                  {queue.map((item) => {
                    const statusKey = (item.queueStatus || "").toLowerCase();
                    return (
                      <View key={item.id} style={styles.queueItemCard}>
                        <View style={styles.queueItemLeft}>
                          <View style={styles.tokenBadge}>
                            <Text style={styles.tokenText}>{item.tokenNumber}</Text>
                            <Text style={styles.queueNumText}>#{item.queueNumber}</Text>
                          </View>
                          <View>
                            <Text style={styles.appointmentNum}>Appt ID: {item.appointmentNumber}</Text>
                            <Text style={styles.checkedInTime}>
                              Checked In: {new Date(item.checkedInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.queueItemRight}>
                          <Text style={[styles.statusBadge, styles[statusKey as keyof typeof styles] || styles.waiting]}>
                            {item.queueStatus}
                          </Text>
                          {(item.queueStatus === "WAITING" || item.queueStatus === "CALLED") && (
                            <TouchableOpacity
                              style={styles.inlineSkipBtn}
                              onPress={() => handleSkipPatient(item.id)}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.inlineSkipText}>Skip</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", overflow: "hidden" },
  gradientContainer: { flex: 1 },
  scrollContent: { padding: 22, maxWidth: 640, alignSelf: "center", width: "100%" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.5)",
    marginBottom: 20,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 6,
  },
  headerInfo: { flex: 1 },
  portalBadge: { fontSize: 12, fontWeight: "800", color: "#38BDF8", marginBottom: 4, letterSpacing: 0.5 },
  welcomeTitle: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  userEmail: { fontSize: 13, color: "#475569", marginTop: 2 },
  profileMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  metaText: { fontSize: 12, backgroundColor: "rgba(6, 182, 212, 0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, color: "#38BDF8", fontWeight: "700", borderWidth: 1, borderColor: "rgba(56, 189, 248, 0.3)" },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0, 0, 0, 0.04)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.08)" },
  logoutText: { fontSize: 13, fontWeight: "700", color: "#38BDF8" },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    padding: 20,
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.5)",
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 20,
  },
  statBox: { alignItems: "center" },
  statNum: { fontSize: 28, fontWeight: "800", color: "#38BDF8" },
  statLabel: { fontSize: 12, color: "#64748B", marginTop: 2, fontWeight: "600" },
  statDivider: { width: 1, height: 32, backgroundColor: "rgba(0, 0, 0, 0.05)" },
  sectionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.5)",
    marginBottom: 24,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A", marginBottom: 14, letterSpacing: -0.3 },
  activeConsultationBox: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#06B6D4",
  },
  patientIndicatorRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#38BDF8" },
  activePatientTitle: { fontSize: 12, fontWeight: "800", color: "#38BDF8", letterSpacing: 0.5 },
  activeToken: { fontSize: 36, fontWeight: "900", color: "#38BDF8", marginVertical: 4 },
  activePatientLabel: { fontSize: 12, color: "#64748B" },
  activePatientCode: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 16 },
  primaryActionBtn: { width: "100%", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  completeBtn: { backgroundColor: "#06B6D4" },
  primaryActionBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  activeCalledBox: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#38BDF8",
  },
  calledActionRow: { flexDirection: "row", gap: 12, width: "100%", marginTop: 12 },
  halfActionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  startBtn: { backgroundColor: "#0284C7" },
  skipBtn: { backgroundColor: "rgba(0, 0, 0, 0.04)", borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.08)" },
  skipBtnText: { color: "#475569", fontSize: 14, fontWeight: "700" },
  emptyActionBox: { alignItems: "center", paddingVertical: 20 },
  emptyActionText: { color: "#64748B", fontSize: 14, marginBottom: 16 },
  callNextBtn: { backgroundColor: "#06B6D4", paddingHorizontal: 22, paddingVertical: 14, borderRadius: 16 },
  callNextBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  queueHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  refreshLink: { paddingHorizontal: 10, paddingVertical: 4 },
  refreshLinkText: { color: "#38BDF8", fontSize: 13, fontWeight: "700" },
  emptyQueueCard: { backgroundColor: "rgba(255, 255, 255, 0.7)", borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)" },
  emptyQueueText: { color: "#64748B", fontSize: 14 },
  queueList: { gap: 14 },
  queueItemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  queueItemLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  tokenBadge: { backgroundColor: "rgba(6, 182, 212, 0.1)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "rgba(56, 189, 248, 0.3)" },
  tokenText: { fontSize: 18, fontWeight: "800", color: "#38BDF8" },
  queueNumText: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  appointmentNum: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  checkedInTime: { fontSize: 12, color: "#64748B", marginTop: 2 },
  queueItemRight: { alignItems: "flex-end", gap: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 11, fontWeight: "800", overflow: "hidden" },
  waiting: { backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#FBBF24" },
  called: { backgroundColor: "rgba(6, 182, 212, 0.2)", color: "#38BDF8" },
  in_consultation: { backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#34D399" },
  completed: { backgroundColor: "rgba(0, 0, 0, 0.05)", color: "#64748B" },
  skipped: { backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#F87171" },
  inlineSkipBtn: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "rgba(0, 0, 0, 0.04)", borderRadius: 8, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.08)" },
  inlineSkipText: { fontSize: 11, color: "#475569", fontWeight: "700" },
  formCard: { backgroundColor: "rgba(255, 255, 255, 0.7)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(56, 189, 248, 0.5)", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8, marginBottom: 20 },
  sectionHeader: { fontSize: 16, fontWeight: "800", color: "#38BDF8", marginTop: 10, marginBottom: 14 },
  formDivider: { height: 1, backgroundColor: "rgba(0, 0, 0, 0.05)", marginVertical: 18 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 6 },
  pickerWrapper: { borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)", borderRadius: 12, backgroundColor: "rgba(255, 255, 255, 0.7)", overflow: "hidden", height: 50, justifyContent: "center" },
  textInput: { borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "rgba(255, 255, 255, 0.7)", fontSize: 14, color: "#0F172A", marginBottom: 12 },
  emptyText: { color: "#64748B", fontSize: 14 },
});
