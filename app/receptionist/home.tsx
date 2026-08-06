import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar, ActivityIndicator,
  Modal, TextInput
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { getUserSession } from "../../src/storage/AuthStorage";
import { getAllReceptionists, ReceptionistResponse, createReceptionistProfile } from "../../src/services/ReceptionistService";
import { getAllHospitals, HospitalResponse } from "../../src/services/HospitalService";
import { getDepartmentsByHospital, DepartmentResponse } from "../../src/services/DepartmentService";
import { getAllDoctors, DoctorResponse } from "../../src/services/DoctorService";
import { getAllPatients, PatientResponse } from "../../src/services/PatientService";
import { getTodayQueueByDoctor, QueueResponse, checkIn } from "../../src/services/QueueService";
import { createAppointment, getTodayAppointments, AppointmentResponse } from "../../src/services/AppointmentService";
import CustomInput from "../../src/components/inputs/CustomInput";
import PrimaryButton from "../../src/components/buttons/PrimaryButton";

export default function ReceptionistHomeScreen() {
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState<any>(null);
  const [profile, setProfile] = useState<ReceptionistResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [needsProfile, setNeedsProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [departments, setDepartments] = useState<DepartmentResponse[]>([]);
  
  const [selectedHospitalIdProfile, setSelectedHospitalIdProfile] = useState("");
  const [selectedDepartmentIdProfile, setSelectedDepartmentIdProfile] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [shift, setShift] = useState("MORNING");
  const [joiningDate, setJoiningDate] = useState("");

  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedDoctorQueue, setSelectedDoctorQueue] = useState<QueueResponse[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<AppointmentResponse[]>([]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingPatientId, setBookingPatientId] = useState("");
  const [bookingDoctorId, setBookingDoctorId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingReason, setBookingReason] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const handleLogout = () => {
    router.push("/logout?role=receptionist");
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();
      setSessionUser(session);

      if (session?.email) {
        const receptionistList = await getAllReceptionists();
        const foundProfile = receptionistList.find(r => r.accountId === session.id);
        if (foundProfile) {
          setProfile(foundProfile);
          setNeedsProfile(false);
        } else {
          setNeedsProfile(true);
          const data = await getAllHospitals();
          setHospitals(data);
          if (data.length > 0) {
            setSelectedHospitalIdProfile(data[0].id);
          }
        }
      }

      const docList = await getAllDoctors();
      setDoctors(docList);

      const patList = await getAllPatients();
      setPatients(patList);

      if (docList.length > 0) {
        setSelectedDoctorId(docList[0].id);
        const q = await getTodayQueueByDoctor(docList[0].id);
        setSelectedDoctorQueue(q);
      }
      
      const appts = await getTodayAppointments();
      setTodayAppointments(appts);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error loading reception workspace",
        text2: err?.message || "Failed to fetch directory details",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = async (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    if (!doctorId) {
      setSelectedDoctorQueue([]);
      return;
    }
    try {
      const q = await getTodayQueueByDoctor(doctorId);
      setSelectedDoctorQueue(q);
    } catch {
      setSelectedDoctorQueue([]);
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      setLoading(true);
      await checkIn({ appointmentId });
      Toast.show({
        type: "success",
        text1: "Check-in Successful",
        text2: "Patient added to the waiting queue.",
      });
      // Refresh data
      const appts = await getTodayAppointments();
      setTodayAppointments(appts);
      if (selectedDoctorId) {
        const q = await getTodayQueueByDoctor(selectedDoctorId);
        setSelectedDoctorQueue(q);
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Check-in Failed",
        text2: error.response?.data?.message || error.message || "Failed to check in.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async () => {
    if (!bookingPatientId || !bookingDoctorId || !bookingDate || !bookingTime) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill in all mandatory appointment fields.",
      });
      return;
    }

    try {
      setBookingLoading(true);
      const selectedDoc = doctors.find(d => d.id === bookingDoctorId);

      let dateFormatted = bookingDate;
      if (bookingDate.includes("-")) {
        const parts = bookingDate.split("-");
        if (parts.length === 3) {
          const y = parts[0];
          const m = parts[1].padStart(2, "0");
          const d = parts[2].padStart(2, "0");
          dateFormatted = `${y}-${m}-${d}`;
        }
      }

      let timeFormatted = bookingTime;
      if (bookingTime.includes(":")) {
        const parts = bookingTime.split(":");
        if (parts.length >= 2) {
          const h = parts[0].padStart(2, "0");
          const m = parts[1].padStart(2, "0");
          timeFormatted = `${h}:${m}`;
        }
      }

      await createAppointment({
        patientId: bookingPatientId,
        doctorId: bookingDoctorId,
        hospitalId: selectedDoc?.hospitalId || profile?.hospitalId || undefined,
        departmentId: selectedDoc?.departmentId || profile?.departmentId || undefined,
        appointmentDate: dateFormatted,
        appointmentTime: timeFormatted,
        appointmentType: "WALK_IN",
        consultationMode: "OPD",
        remarks: bookingReason,
      });

      Toast.show({
        type: "success",
        text1: "Appointment Scheduled",
        text2: "Walk-in appointment registered successfully!",
      });

      setShowBookingModal(false);
      setBookingPatientId("");
      setBookingDoctorId("");
      setBookingDate("");
      setBookingTime("");
      setBookingReason("");

      if (selectedDoctorId) {
        handleDoctorChange(selectedDoctorId);
      }
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to schedule appointment.";
      Toast.show({
        type: "error",
        text1: "Booking Failed",
        text2: errorMsg,
      });
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const fetchDepts = async () => {
      if (selectedHospitalIdProfile) {
        try {
          const depts = await getDepartmentsByHospital(selectedHospitalIdProfile);
          setDepartments(depts);
          if (depts.length > 0) {
            setSelectedDepartmentIdProfile(depts[0].id);
          } else {
            setSelectedDepartmentIdProfile("");
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchDepts();
  }, [selectedHospitalIdProfile]);

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      if (!selectedHospitalIdProfile || !selectedDepartmentIdProfile || !employeeCode || !joiningDate) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please fill all required fields." });
        return;
      }
      let dateFormatted = joiningDate.trim();
      if (dateFormatted.includes("-")) {
        const parts = dateFormatted.split("-");
        if (parts.length === 3) {
          const y = parts[0];
          const m = parts[1].padStart(2, "0");
          const d = parts[2].padStart(2, "0");
          dateFormatted = `${y}-${m}-${d}`;
        }
      }

      await createReceptionistProfile({
        accountId: sessionUser.id,
        hospitalId: selectedHospitalIdProfile || undefined,
        departmentId: selectedDepartmentIdProfile || undefined,
        employeeCode: employeeCode.trim(),
        shift: shift,
        joiningDate: dateFormatted,
      });
      Toast.show({ type: "success", text1: "Profile Completed!" });
      loadData();
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error Saving Profile", text2: err?.message || "Please try again." });
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C4B5FD" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LinearGradient
        colors={["#F8FAFC", "#F1F5F9", "#F3E8FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.portalBadge}>📋 RECEPTION DESK</Text>
              <Text style={styles.welcomeTitle}>
                {profile ? `${profile.accountName} 📋` : "Receptionist 👋"}
              </Text>
              <Text style={styles.userEmail}>{sessionUser?.email || "reception@healthnexus.com"}</Text>
              {profile && (
                <View style={styles.profileMeta}>
                  <Text style={styles.metaText}>Emp Code: {profile.employeeCode}</Text>
                  <Text style={styles.metaText}>{profile.hospitalName}</Text>
                  <Text style={styles.metaText}>{profile.departmentName}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={16} color="#C4B5FD" />
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
                  <Picker selectedValue={selectedHospitalIdProfile} onValueChange={setSelectedHospitalIdProfile} dropdownIconColor="#64748B" style={{ color: "#0F172A", height: 50, borderWidth: 0, backgroundColor: "transparent", outlineStyle: 'none' } as any}>
                    <Picker.Item label="-- Select Hospital --" value="" color="#64748B" />
                    {hospitals.map(h => <Picker.Item key={h.id} label={h.hospitalName} value={h.id} color="#0F172A" />)}
                  </Picker>
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={styles.fieldLabel}>Select Department *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker selectedValue={selectedDepartmentIdProfile} onValueChange={setSelectedDepartmentIdProfile} dropdownIconColor="#64748B" style={{ color: "#0F172A", height: 50, borderWidth: 0, backgroundColor: "transparent", outlineStyle: 'none' } as any}>
                    <Picker.Item label="-- Select Department --" value="" color="#64748B" />
                    {departments.map(d => <Picker.Item key={d.id} label={d.departmentName} value={d.id} color="#0F172A" />)}
                  </Picker>
                </View>
              </View>

              <CustomInput label="Employee Code *" placeholder="e.g. REC-101" value={employeeCode} onChangeText={setEmployeeCode} maxLength={20} darkTheme={true} />
              
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.fieldLabel}>Shift *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker selectedValue={shift} onValueChange={setShift} dropdownIconColor="#64748B" style={{ color: "#0F172A", height: 50, borderWidth: 0, backgroundColor: "transparent", outlineStyle: 'none' } as any}>
                    <Picker.Item label="Morning" value="MORNING" color="#0F172A" />
                    <Picker.Item label="Evening" value="EVENING" color="#0F172A" />
                    <Picker.Item label="Night" value="NIGHT" color="#0F172A" />
                  </Picker>
                </View>
              </View>

              <CustomInput label="Joining Date (YYYY-MM-DD) *" placeholder="2026-08-05" value={joiningDate} onChangeText={setJoiningDate} darkTheme={true} />
              
              <PrimaryButton title="Save Profile" onPress={handleSaveProfile} loading={savingProfile} style={{ marginTop: 20, backgroundColor: "#8B5CF6" }} />
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.bookWalkinBtn}
                onPress={() => setShowBookingModal(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.bookWalkinBtnText}>➕ Book Walk-in Appointment</Text>
              </TouchableOpacity>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Today{"'"}s Scheduled Appointments</Text>
                {todayAppointments.filter(a => a.appointmentStatus === "SCHEDULED").length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No appointments pending check-in.</Text>
                  </View>
                ) : (
                  <View style={styles.queueList}>
                    {todayAppointments.filter(a => a.appointmentStatus === "SCHEDULED").map(appt => (
                      <View key={appt.id} style={styles.queueCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.apptNum}>Patient ID: {appt.patientId}</Text>
                          <Text style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
                            Time: {appt.appointmentTime} | Type: {appt.appointmentType}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[styles.editProfileBtn, { backgroundColor: "rgba(13, 110, 253, 0.1)", borderColor: "rgba(13, 110, 253, 0.3)" }]}
                          onPress={() => handleCheckIn(appt.id)}
                          disabled={loading}
                        >
                          <Text style={[styles.editProfileText, { color: "#0D6EFD" }]}>Check In</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Doctor Queue Monitoring</Text>

                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.fieldLabel}>Select Doctor to View Today{"'"}s Live Queue</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedDoctorId}
                      onValueChange={(val: any) => handleDoctorChange(val)}
                      dropdownIconColor="#64748B"
                      style={{ color: "#0F172A", height: 50, borderWidth: 0, backgroundColor: "transparent", outlineStyle: 'none' } as any}
                    >
                      {doctors.map(d => (
                        <Picker.Item key={d.id} label={`Dr. ${d.accountName} (${d.specialization})`} value={d.id} color="#0F172A" />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.queueHeaderRow}>
                  <Text style={styles.queueHeaderTitle}>Active Queue ({selectedDoctorQueue.length})</Text>
                </View>

                {selectedDoctorQueue.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No patient tokens generated for this doctor today.</Text>
                  </View>
                ) : (
                  <View style={styles.queueList}>
                    {selectedDoctorQueue.map(item => (
                      <View key={item.id} style={styles.queueCard}>
                        <View style={styles.tokenBox}>
                          <Text style={styles.tokenNum}>{item.tokenNumber}</Text>
                          <Text style={styles.queueNum}>#{item.queueNumber}</Text>
                        </View>
                        <View style={styles.tokenMeta}>
                          <Text style={styles.apptNum}>Appt: {item.appointmentNumber}</Text>
                          <Text style={styles.statusBadge}>{item.queueStatus}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}

        </ScrollView>

        <Modal
          visible={showBookingModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowBookingModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Book Walk-in Appointment</Text>
                <TouchableOpacity
                  onPress={() => setShowBookingModal(false)}
                  style={styles.modalCloseIconBtn}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>Register a walk-in patient consultation slot.</Text>

              <View style={{ marginBottom: 16 }}>
                <Text style={styles.fieldLabel}>Select Patient *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={bookingPatientId}
                    onValueChange={(val: any) => setBookingPatientId(val)}
                    dropdownIconColor="#64748B"
                    style={{ color: "#0F172A", height: 50, borderWidth: 0, backgroundColor: "transparent", outlineStyle: 'none' } as any}
                  >
                    <Picker.Item label="-- Select Patient --" value="" color="#64748B" />
                    {patients.map(p => (
                      <Picker.Item key={p.id} label={`${p.accountName} (Code: ${p.patientCode})`} value={p.id} color="#0F172A" />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={styles.fieldLabel}>Select Doctor *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={bookingDoctorId}
                    onValueChange={(val: any) => setBookingDoctorId(val)}
                    dropdownIconColor="#64748B"
                    style={{ color: "#0F172A", height: 50, borderWidth: 0, backgroundColor: "transparent", outlineStyle: 'none' } as any}
                  >
                    <Picker.Item label="-- Select Doctor --" value="" color="#64748B" />
                    {doctors.map(d => (
                      <Picker.Item key={d.id} label={`Dr. ${d.accountName} (${d.specialization})`} value={d.id} color="#0F172A" />
                    ))}
                  </Picker>
                </View>
              </View>

              <CustomInput
                label="Appointment Date (yyyy-MM-dd) *"
                placeholder="2026-08-05"
                value={bookingDate}
                onChangeText={setBookingDate}
                darkTheme={true}
              />

              <CustomInput
                label="Appointment Time (HH:mm:ss) *"
                placeholder="10:30:00"
                value={bookingTime}
                onChangeText={setBookingTime}
                darkTheme={true}
              />

              <CustomInput
                label="Reason for Visit"
                placeholder="e.g. Regular Checkup / Fever"
                value={bookingReason}
                onChangeText={setBookingReason}
                darkTheme={true}
              />

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowBookingModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <PrimaryButton
                  title="Book Appointment"
                  onPress={handleCreateAppointment}
                  loading={bookingLoading}
                  style={styles.modalSubmitBtn}
                />
              </View>
            </View>
          </View>
        </Modal>
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
    borderColor: "rgba(167, 139, 250, 0.5)",
    marginBottom: 20,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 6,
  },
  headerInfo: { flex: 1 },
  portalBadge: { fontSize: 12, fontWeight: "800", color: "#C4B5FD", marginBottom: 4, letterSpacing: 0.5 },
  welcomeTitle: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  userEmail: { fontSize: 13, color: "#475569", marginTop: 2 },
  profileMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  metaText: { fontSize: 12, backgroundColor: "rgba(139, 92, 246, 0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, color: "#C4B5FD", fontWeight: "700", borderWidth: 1, borderColor: "rgba(167, 139, 250, 0.3)" },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0, 0, 0, 0.04)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.08)" },
  logoutText: { fontSize: 13, fontWeight: "700", color: "#C4B5FD" },
  bookWalkinBtn: { backgroundColor: "#8B5CF6", paddingVertical: 14, borderRadius: 16, alignItems: "center", marginBottom: 20, shadowColor: "#8B5CF6", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 6 },
  bookWalkinBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", letterSpacing: 0.3 },
  sectionCard: { backgroundColor: "rgba(255, 255, 255, 0.7)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(167, 139, 250, 0.5)", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 14, elevation: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A", marginBottom: 14, letterSpacing: -0.3 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6 },
  pickerWrapper: { borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)", borderRadius: 12, backgroundColor: "rgba(255, 255, 255, 0.7)", overflow: "hidden", height: 50, justifyContent: "center" },
  queueHeaderRow: { marginTop: 10, marginBottom: 10 },
  queueHeaderTitle: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  emptyCard: { backgroundColor: "rgba(255, 255, 255, 0.7)", borderRadius: 14, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)" },
  emptyText: { color: "#64748B", fontSize: 13 },
  queueList: { gap: 12 },
  queueCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.7)", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)" },
  tokenBox: { alignItems: "center" },
  tokenNum: { fontSize: 18, fontWeight: "800", color: "#C4B5FD" },
  queueNum: { fontSize: 11, color: "#64748B" },
  tokenMeta: { alignItems: "flex-end", gap: 4 },
  apptNum: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  statusBadge: { fontSize: 11, fontWeight: "800", color: "#C4B5FD", backgroundColor: "rgba(139, 92, 246, 0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "rgba(167, 139, 250, 0.3)" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.4)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  modalContainer: { backgroundColor: "rgba(255, 255, 255, 0.95)", borderRadius: 24, padding: 24, width: "100%", maxWidth: 460, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 12 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalCloseIconBtn: { padding: 4 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A", marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: "#475569", marginBottom: 16 },
  modalButtonRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 18 },
  modalCancelBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(0, 0, 0, 0.05)", borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)" },
  modalCancelText: { color: "#475569", fontSize: 14, fontWeight: "700" },
  modalSubmitBtn: { backgroundColor: "#8B5CF6", paddingHorizontal: 20 },
  formCard: { backgroundColor: "rgba(255, 255, 255, 0.7)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(167, 139, 250, 0.5)", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8, marginBottom: 20 },
  sectionHeader: { fontSize: 16, fontWeight: "800", color: "#8B5CF6", marginTop: 10, marginBottom: 14 },
  editProfileBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  editProfileText: { fontSize: 13, fontWeight: "700" },
});
