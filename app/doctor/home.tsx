import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar, ActivityIndicator,
  RefreshControl, Modal
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import { getUserSession } from "../../src/storage/AuthStorage";
import { getDoctorByAccountId, DoctorResponse, createDoctorProfile, updateDoctorProfile } from "../../src/services/DoctorService";
import { getAllHospitals, HospitalResponse } from "../../src/services/HospitalService";
import { getDepartmentsByHospital, DepartmentResponse } from "../../src/services/DepartmentService";
import { getAppointmentsByDoctor, AppointmentResponse } from "../../src/services/AppointmentService";
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
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [activeTab, setActiveTab] = useState<"queue" | "appointments">("queue");

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

  // Edit profile
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSpecialization, setEditSpecialization] = useState("");
  const [editQualification, setEditQualification] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editFee, setEditFee] = useState("");
  const [editLicense, setEditLicense] = useState("");
  const [editHospitalId, setEditHospitalId] = useState("");
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [editDepartments, setEditDepartments] = useState<DepartmentResponse[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const handleLogout = () => {
    router.push("/logout?role=doctor");
  };

  const loadData = async (showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) setLoading(true);
      const session = await getUserSession();
      setSessionUser(session);

      if (session?.id) {
        try {
          const foundProfile = await getDoctorByAccountId(session.id);
          setProfile(foundProfile);
          const doctorQueue = await getTodayQueueByDoctor(foundProfile.id);
          setQueue(doctorQueue);
          try {
            const appts = await getAppointmentsByDoctor(foundProfile.id);
            setAppointments(appts);
          } catch { setAppointments([]); }
          setNeedsProfile(false);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            setNeedsProfile(true);
            const data = await getAllHospitals();
            setHospitals(data.content);
            if (data.content.length > 0) setSelectedHospitalId(data.content[0].id);
          } else {
            throw err;
          }
        }
      }
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error loading dashboard", text2: err?.message || "Failed to fetch data" });
    } finally {
      if (showLoadingIndicator) setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(false);
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const fetchDepts = async () => {
      if (selectedHospitalId) {
        try {
          const depts = await getDepartmentsByHospital(selectedHospitalId);
          setDepartments(depts);
          if (depts.length > 0) setSelectedDepartmentId(depts[0].id);
          else setSelectedDepartmentId("");
        } catch { }
      }
    };
    fetchDepts();
  }, [selectedHospitalId]);

  useEffect(() => {
    const fetchDepts = async () => {
      if (editHospitalId) {
        try {
          const depts = await getDepartmentsByHospital(editHospitalId);
          setEditDepartments(depts);
          if (depts.length > 0) setEditDepartmentId(depts[0].id);
          else setEditDepartmentId("");
        } catch { }
      }
    };
    fetchDepts();
  }, [editHospitalId]);

  const handleSaveProfile = async () => {
    if (!selectedHospitalId) { Toast.show({ type: "error", text1: "Validation", text2: "Please select a hospital." }); return; }
    if (!selectedDepartmentId) { Toast.show({ type: "error", text1: "Validation", text2: "Please select a department." }); return; }
    if (!specialization.trim()) { Toast.show({ type: "error", text1: "Validation", text2: "Specialization is required." }); return; }
    if (!qualification.trim()) { Toast.show({ type: "error", text1: "Validation", text2: "Qualification is required." }); return; }
    if (!experience) { Toast.show({ type: "error", text1: "Validation", text2: "Experience is required." }); return; }
    if (!consultationFee) { Toast.show({ type: "error", text1: "Validation", text2: "Consultation fee is required." }); return; }
    if (!licenseNumber.trim()) { Toast.show({ type: "error", text1: "Validation", text2: "License number is required." }); return; }
    try {
      setSavingProfile(true);
      await createDoctorProfile({
        accountId: sessionUser.id,
        hospitalId: selectedHospitalId,
        departmentId: selectedDepartmentId,
        specialization: specialization.trim(),
        qualification: qualification.trim(),
        experience: parseInt(experience, 10),
        consultationFee: parseFloat(consultationFee),
        licenseNumber: licenseNumber.trim(),
      });
      Toast.show({ type: "success", text1: "Profile Completed!" });
      loadData();
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err?.response?.data?.message || err?.message || "Failed to save." });
    } finally { setSavingProfile(false); }
  };

  const openEditModal = async () => {
    if (!profile) return;
    setEditSpecialization(profile.specialization || "");
    setEditQualification(profile.qualification || "");
    setEditExperience(String(profile.experience || ""));
    setEditFee(String(profile.consultationFee || ""));
    setEditLicense(profile.licenseNumber || "");
    setEditHospitalId(profile.hospitalId || "");
    const allHospitals = await getAllHospitals();
    setHospitals(allHospitals.content);
    if (profile.hospitalId) {
      try {
        const depts = await getDepartmentsByHospital(profile.hospitalId);
        setEditDepartments(depts);
        setEditDepartmentId(profile.departmentId || (depts.length > 0 ? depts[0].id : ""));
      } catch { }
    }
    setShowEditModal(true);
  };

  const handleEditProfile = async () => {
    if (!profile) return;
    if (!editSpecialization.trim()) { Toast.show({ type: "error", text1: "Validation", text2: "Specialization is required." }); return; }
    if (!editLicense.trim()) { Toast.show({ type: "error", text1: "Validation", text2: "License number is required." }); return; }
    try {
      setSavingEdit(true);
      await updateDoctorProfile(profile.id, {
        accountId: sessionUser.id,
        hospitalId: editHospitalId || profile.hospitalId,
        departmentId: editDepartmentId || profile.departmentId,
        specialization: editSpecialization.trim(),
        qualification: editQualification.trim(),
        experience: parseInt(editExperience, 10) || profile.experience,
        consultationFee: parseFloat(editFee) || profile.consultationFee,
        licenseNumber: editLicense.trim(),
      });
      Toast.show({ type: "success", text1: "Profile Updated!" });
      setShowEditModal(false);
      loadData();
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Update Failed", text2: err?.response?.data?.message || err?.message || "Please try again." });
    } finally { setSavingEdit(false); }
  };

  const handleCallNext = async () => {
    if (!profile) return;
    try {
      setLoading(true);
      const res = await callNextPatient(profile.id);
      Toast.show({ type: "success", text1: "Patient Called", text2: `Token ${res.tokenNumber} called.` });
      await loadData(false);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Unable to Call Next", text2: err?.response?.data?.message || err?.message || "No waiting patients." });
    } finally { setLoading(false); }
  };

  const handleStartConsultation = async (queueId: string) => {
    try {
      setLoading(true);
      await startConsultation(queueId);
      Toast.show({ type: "success", text1: "Consultation Started" });
      await loadData(false);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err?.response?.data?.message || err?.message || "Failed." });
    } finally { setLoading(false); }
  };

  const handleCompleteConsultation = async (queueId: string) => {
    try {
      setLoading(true);
      await completeConsultation(queueId);
      Toast.show({ type: "success", text1: "Consultation Completed" });
      await loadData(false);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err?.response?.data?.message || err?.message || "Failed." });
    } finally { setLoading(false); }
  };

  const handleSkipPatient = async (queueId: string) => {
    try {
      setLoading(true);
      await skipQueuePatient(queueId);
      Toast.show({ type: "info", text1: "Patient Skipped" });
      await loadData(false);
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error", text2: err?.response?.data?.message || err?.message || "Failed." });
    } finally { setLoading(false); }
  };

  const getWaitingCount = () => queue.filter(q => q.queueStatus === "WAITING").length;
  const getInConsultationCount = () => queue.filter(q => q.queueStatus === "IN_CONSULTATION").length;
  const getCompletedCount = () => queue.filter(q => q.queueStatus === "COMPLETED").length;
  const activeConsultation = queue.find(q => q.queueStatus === "IN_CONSULTATION");
  const calledPatient = queue.find(q => q.queueStatus === "CALLED");

  if (loading && !refreshing) {
    return (<View style={styles.loadingContainer}><ActivityIndicator size="large" color="#38BDF8" /></View>);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LinearGradient colors={["#F8FAFC", "#F1F5F9", "#E2E8F0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                <Ionicons name="arrow-back" size={20} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onRefresh} style={styles.iconBtn}>
                <Ionicons name="refresh" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <View style={styles.headerInfo}>
                <Text style={styles.portalBadge}>👨‍⚕️ DOCTOR CONSOLE</Text>
                <Text style={styles.welcomeTitle}>{profile ? `Dr. ${profile.accountName}` : "Doctor Workspace"}</Text>
                <Text style={styles.userEmail}>{sessionUser?.email || ""}</Text>
              {profile && (
                <View style={styles.profileMeta}>
                  <Text style={styles.metaText}>{profile.specialization || "General"}</Text>
                  <Text style={styles.metaText}>{profile.departmentName || "Dept"}</Text>
                  <Text style={styles.metaText}>Lic: {profile.licenseNumber || "N/A"}</Text>
                </View>
              )}
            </View>
              <View style={styles.headerActions}>
                {profile && (
                  <TouchableOpacity style={styles.editBtn} onPress={openEditModal} activeOpacity={0.8}>
                    <Ionicons name="pencil-outline" size={14} color="#38BDF8" />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                  <Ionicons name="log-out-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {needsProfile ? (
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Complete Your Profile</Text>
              <Text style={[styles.emptyText, { marginBottom: 16 }]}>Fill in your professional details to proceed.</Text>
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.fieldLabel}>Select Hospital *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker selectedValue={selectedHospitalId} onValueChange={setSelectedHospitalId} dropdownIconColor="#64748B" style={{ color: "#0F172A", height: 50, outlineStyle: "none" } as any}>
                    <Picker.Item label="-- Select Hospital --" value="" color="#64748B" />
                    {hospitals.map(h => <Picker.Item key={h.id} label={h.hospitalName} value={h.id} color="#0F172A" />)}
                  </Picker>
                </View>
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.fieldLabel}>Select Department *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker selectedValue={selectedDepartmentId} onValueChange={setSelectedDepartmentId} dropdownIconColor="#64748B" style={{ color: "#0F172A", height: 50, outlineStyle: "none" } as any}>
                    <Picker.Item label="-- Select Department --" value="" color="#64748B" />
                    {departments.map(d => <Picker.Item key={d.id} label={d.departmentName} value={d.id} color="#0F172A" />)}
                  </Picker>
                </View>
              </View>
              <CustomInput label="Specialization *" placeholder="e.g. Cardiologist" value={specialization} onChangeText={setSpecialization} darkTheme={true} />
              <CustomInput label="Qualification *" placeholder="e.g. MD, MBBS" value={qualification} onChangeText={setQualification} darkTheme={true} />
              <CustomInput label="Experience (Years) *" placeholder="e.g. 5" value={experience} onChangeText={setExperience} keyboardType="numeric" maxLength={2} darkTheme={true} />
              <CustomInput label="Consultation Fee *" placeholder="e.g. 500" value={consultationFee} onChangeText={setConsultationFee} keyboardType="numeric" darkTheme={true} />
              <CustomInput label="License Number *" placeholder="Enter Medical License" value={licenseNumber} onChangeText={setLicenseNumber} maxLength={15} darkTheme={true} />
              <PrimaryButton title="Save Profile" onPress={handleSaveProfile} loading={savingProfile} style={{ marginTop: 20, backgroundColor: "#38BDF8" }} />
            </View>
          ) : (
            <>
              {/* Stats */}
              <View style={styles.summaryCard}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{getWaitingCount()}</Text>
                  <Text style={styles.statLabel}>Waiting</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{getInConsultationCount()}</Text>
                  <Text style={styles.statLabel}>In Progress</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{getCompletedCount()}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{appointments.length}</Text>
                  <Text style={styles.statLabel}>Total Appts</Text>
                </View>
              </View>

              {/* Tabs */}
              <View style={styles.tabRow}>
                <TouchableOpacity style={[styles.tab, activeTab === "queue" && styles.activeTab]} onPress={() => setActiveTab("queue")} activeOpacity={0.8}>
                  <Text style={[styles.tabText, activeTab === "queue" && styles.activeTabText]}>📋 Today's Queue</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === "appointments" && styles.activeTab]} onPress={() => setActiveTab("appointments")} activeOpacity={0.8}>
                  <Text style={[styles.tabText, activeTab === "appointments" && styles.activeTabText]}>📅 Appointments</Text>
                </TouchableOpacity>
              </View>

              {activeTab === "queue" ? (
                <>
                  {/* Active Consultation */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Active Consultation Desk</Text>
                    {activeConsultation ? (
                      <View style={styles.activeConsultationBox}>
                        <View style={styles.patientIndicatorRow}>
                          <View style={styles.pulseDot} />
                          <Text style={styles.activePatientTitle}>CONSULTATION IN PROGRESS</Text>
                        </View>
                        <Text style={styles.activeToken}>{activeConsultation.tokenNumber}</Text>
                        <Text style={styles.activePatientLabel}>Appointment Ref</Text>
                        <Text style={styles.activePatientCode}>{activeConsultation.appointmentNumber}</Text>
                        <TouchableOpacity style={[styles.primaryActionBtn, styles.completeBtn]} onPress={() => handleCompleteConsultation(activeConsultation.id)} activeOpacity={0.85}>
                          <Text style={styles.primaryActionBtnText}>✅ Complete Consultation</Text>
                        </TouchableOpacity>
                      </View>
                    ) : calledPatient ? (
                      <View style={styles.activeCalledBox}>
                        <Text style={styles.activePatientTitle}>PATIENT CALLED TO DESK</Text>
                        <Text style={[styles.activeToken, { color: "#38BDF8" }]}>{calledPatient.tokenNumber}</Text>
                        <Text style={styles.activePatientLabel}>Appointment Ref</Text>
                        <Text style={styles.activePatientCode}>{calledPatient.appointmentNumber}</Text>
                        <View style={styles.calledActionRow}>
                          <TouchableOpacity style={[styles.halfActionBtn, styles.startBtn]} onPress={() => handleStartConsultation(calledPatient.id)} activeOpacity={0.85}>
                            <Text style={styles.primaryActionBtnText}>🩺 Start</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.halfActionBtn, styles.skipBtn]} onPress={() => handleSkipPatient(calledPatient.id)} activeOpacity={0.8}>
                            <Text style={styles.skipBtnText}>⏭️ Skip</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.emptyActionBox}>
                        <Text style={styles.emptyActionText}>No patient currently called or in consultation.</Text>
                        <TouchableOpacity style={styles.callNextBtn} onPress={handleCallNext} activeOpacity={0.85}>
                          <Text style={styles.callNextBtnText}>📢 Call Next Patient</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Queue List */}
                  <View style={styles.queueHeaderRow}>
                    <Text style={styles.sectionTitle}>Today's Queue List</Text>
                    <TouchableOpacity style={styles.refreshLink} onPress={onRefresh} activeOpacity={0.8}>
                      <Text style={styles.refreshLinkText}>🔄 Refresh</Text>
                    </TouchableOpacity>
                  </View>
                  {queue.length === 0 ? (
                    <View style={styles.emptyQueueCard}><Text style={styles.emptyQueueText}>No tokens generated for today yet.</Text></View>
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
                                <Text style={styles.appointmentNum}>Appt: {item.appointmentNumber}</Text>
                                <Text style={styles.checkedInTime}>
                                  In: {new Date(item.checkedInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.queueItemRight}>
                              <Text style={[styles.statusBadge, (styles as any)[statusKey] || styles.waiting]}>{item.queueStatus}</Text>
                              {(item.queueStatus === "WAITING" || item.queueStatus === "CALLED") && (
                                <TouchableOpacity style={styles.inlineSkipBtn} onPress={() => handleSkipPatient(item.id)} activeOpacity={0.8}>
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
              ) : (
                // Appointments Tab
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>My Appointments</Text>
                  {appointments.length === 0 ? (
                    <View style={styles.emptyActionBox}>
                      <Text style={styles.emptyActionText}>No appointments found.</Text>
                    </View>
                  ) : (
                    <View style={{ gap: 12 }}>
                      {appointments.map((appt) => (
                        <View key={appt.id} style={styles.apptCard}>
                          <View style={styles.apptCardHeader}>
                            <Text style={styles.apptNumber}>{appt.appointmentNumber}</Text>
                            <Text style={[styles.apptStatusBadge, appt.appointmentStatus === "COMPLETED" ? styles.apptCompleted : appt.appointmentStatus === "CANCELLED" ? styles.apptCancelled : styles.apptScheduled]}>
                              {appt.appointmentStatus}
                            </Text>
                          </View>
                          <Text style={styles.apptPatient}>👤 {appt.patientName || "Patient"}</Text>
                          <Text style={styles.apptDate}>📅 {appt.appointmentDate} at {appt.appointmentTime}</Text>
                          {appt.remarks ? <Text style={styles.apptRemarks}>💬 {appt.remarks}</Text> : null}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="fade" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.fieldLabel}>Hospital</Text>
                <View style={styles.pickerWrapper}>
                  <Picker selectedValue={editHospitalId} onValueChange={setEditHospitalId} dropdownIconColor="#64748B" style={{ color: "#0F172A", height: 50, outlineStyle: "none" } as any}>
                    {hospitals.map(h => <Picker.Item key={h.id} label={h.hospitalName} value={h.id} color="#0F172A" />)}
                  </Picker>
                </View>
              </View>
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.fieldLabel}>Department</Text>
                <View style={styles.pickerWrapper}>
                  <Picker selectedValue={editDepartmentId} onValueChange={setEditDepartmentId} dropdownIconColor="#64748B" style={{ color: "#0F172A", height: 50, outlineStyle: "none" } as any}>
                    {editDepartments.map(d => <Picker.Item key={d.id} label={d.departmentName} value={d.id} color="#0F172A" />)}
                  </Picker>
                </View>
              </View>
              <CustomInput label="Specialization *" placeholder="e.g. Cardiologist" value={editSpecialization} onChangeText={setEditSpecialization} darkTheme={true} />
              <CustomInput label="Qualification" placeholder="e.g. MD, MBBS" value={editQualification} onChangeText={setEditQualification} darkTheme={true} />
              <CustomInput label="Experience (Years)" placeholder="e.g. 5" value={editExperience} onChangeText={setEditExperience} keyboardType="numeric" maxLength={2} darkTheme={true} />
              <CustomInput label="Consultation Fee" placeholder="e.g. 500" value={editFee} onChangeText={setEditFee} keyboardType="numeric" darkTheme={true} />
              <CustomInput label="License Number *" placeholder="Enter Medical License" value={editLicense} onChangeText={setEditLicense} maxLength={15} darkTheme={true} />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowEditModal(false)} activeOpacity={0.8}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <PrimaryButton title="Save Changes" onPress={handleEditProfile} loading={savingEdit} style={{ flex: 1, backgroundColor: "#38BDF8" }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", overflow: "hidden" },
  gradientContainer: { flex: 1 },
  scrollContent: { padding: 22, maxWidth: 640, alignSelf: "center", width: "100%", paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  header: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 1)",
    marginBottom: 20,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  headerInfo: { flex: 1 },
  headerActions: { gap: 8, alignItems: "flex-end" },
  portalBadge: { fontSize: 12, fontWeight: "800", color: "#38BDF8", marginBottom: 4, letterSpacing: 0.5 },
  welcomeTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  userEmail: { fontSize: 13, color: "#475569", marginTop: 2 },
  profileMeta: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  metaText: { fontSize: 12, backgroundColor: "rgba(6,182,212,0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, color: "#38BDF8", fontWeight: "700", borderWidth: 1, borderColor: "rgba(56,189,248,0.3)" },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(56,189,248,0.08)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "rgba(56,189,248,0.3)" },
  editBtnText: { fontSize: 12, fontWeight: "700", color: "#38BDF8" },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.04)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" },
  logoutText: { fontSize: 13, fontWeight: "700", color: "#38BDF8" },
  summaryCard: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 20, padding: 16, justifyContent: "space-around", alignItems: "center", borderWidth: 1, borderColor: "rgba(56,189,248,0.5)", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 14, elevation: 4, marginBottom: 16 },
  statBox: { alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "800", color: "#38BDF8" },
  statLabel: { fontSize: 11, color: "#64748B", marginTop: 2, fontWeight: "600" },
  statDivider: { width: 1, height: 32, backgroundColor: "rgba(0,0,0,0.05)" },
  tabRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center", backgroundColor: "rgba(255,255,255,0.6)", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" },
  activeTab: { backgroundColor: "#38BDF8", borderColor: "#38BDF8" },
  tabText: { fontSize: 13, fontWeight: "700", color: "#64748B" },
  activeTabText: { color: "#FFFFFF" },
  sectionCard: { backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(56,189,248,0.5)", marginBottom: 20, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 14, elevation: 4 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A", marginBottom: 14, letterSpacing: -0.3 },
  activeConsultationBox: { backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 18, padding: 20, alignItems: "center", borderWidth: 1.5, borderColor: "#06B6D4" },
  patientIndicatorRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#38BDF8" },
  activePatientTitle: { fontSize: 12, fontWeight: "800", color: "#38BDF8", letterSpacing: 0.5 },
  activeToken: { fontSize: 36, fontWeight: "900", color: "#38BDF8", marginVertical: 4 },
  activePatientLabel: { fontSize: 12, color: "#64748B" },
  activePatientCode: { fontSize: 14, fontWeight: "700", color: "#0F172A", marginBottom: 16 },
  primaryActionBtn: { width: "100%", paddingVertical: 14, borderRadius: 14, alignItems: "center" },
  completeBtn: { backgroundColor: "#06B6D4" },
  primaryActionBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  activeCalledBox: { backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 18, padding: 20, alignItems: "center", borderWidth: 1.5, borderColor: "#38BDF8" },
  calledActionRow: { flexDirection: "row", gap: 12, width: "100%", marginTop: 12 },
  halfActionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  startBtn: { backgroundColor: "#0284C7" },
  skipBtn: { backgroundColor: "rgba(0,0,0,0.04)", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" },
  skipBtnText: { color: "#475569", fontSize: 14, fontWeight: "700" },
  emptyActionBox: { alignItems: "center", paddingVertical: 20 },
  emptyActionText: { color: "#64748B", fontSize: 14, marginBottom: 16 },
  callNextBtn: { backgroundColor: "#06B6D4", paddingHorizontal: 22, paddingVertical: 14, borderRadius: 16 },
  callNextBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  queueHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  refreshLink: { paddingHorizontal: 10, paddingVertical: 4 },
  refreshLinkText: { color: "#38BDF8", fontSize: 13, fontWeight: "700" },
  emptyQueueCard: { backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" },
  emptyQueueText: { color: "#64748B", fontSize: 14 },
  queueList: { gap: 12 },
  queueItemCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255,255,255,0.7)", padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" },
  queueItemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  tokenBadge: { backgroundColor: "rgba(6,182,212,0.1)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "rgba(56,189,248,0.3)" },
  tokenText: { fontSize: 18, fontWeight: "800", color: "#38BDF8" },
  queueNumText: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  appointmentNum: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  checkedInTime: { fontSize: 12, color: "#64748B", marginTop: 2 },
  queueItemRight: { alignItems: "flex-end", gap: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, fontSize: 11, fontWeight: "800", overflow: "hidden" },
  waiting: { backgroundColor: "rgba(245,158,11,0.2)", color: "#FBBF24" },
  called: { backgroundColor: "rgba(6,182,212,0.2)", color: "#38BDF8" },
  in_consultation: { backgroundColor: "rgba(16,185,129,0.2)", color: "#34D399" },
  completed: { backgroundColor: "rgba(0,0,0,0.05)", color: "#64748B" },
  skipped: { backgroundColor: "rgba(239,68,68,0.2)", color: "#F87171" },
  inlineSkipBtn: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: "rgba(0,0,0,0.04)", borderRadius: 8, borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" },
  inlineSkipText: { fontSize: 11, color: "#475569", fontWeight: "700" },
  apptCard: { backgroundColor: "rgba(255,255,255,0.8)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(56,189,248,0.25)" },
  apptCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  apptNumber: { fontSize: 14, fontWeight: "800", color: "#0F172A" },
  apptStatusBadge: { fontSize: 11, fontWeight: "800", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: "hidden" },
  apptScheduled: { backgroundColor: "rgba(56,189,248,0.15)", color: "#38BDF8" },
  apptCompleted: { backgroundColor: "rgba(16,185,129,0.15)", color: "#34D399" },
  apptCancelled: { backgroundColor: "rgba(239,68,68,0.15)", color: "#F87171" },
  apptPatient: { fontSize: 13, fontWeight: "600", color: "#0F172A", marginBottom: 4 },
  apptDate: { fontSize: 12, color: "#64748B", marginBottom: 4 },
  apptRemarks: { fontSize: 12, color: "#94A3B8", fontStyle: "italic" },
  formCard: { backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(56,189,248,0.5)", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8, marginBottom: 20 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 6 },
  pickerWrapper: { borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", borderRadius: 12, backgroundColor: "rgba(255,255,255,0.7)", overflow: "hidden", height: 50, justifyContent: "center" },
  emptyText: { color: "#64748B", fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(255,255,255,0.88)", justifyContent: "center", alignItems: "center", paddingHorizontal: 16 },
  modalBox: { backgroundColor: "#F8FAFC", borderRadius: 24, padding: 24, width: "100%", maxWidth: 480, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 12, maxHeight: "85%" },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  modalCloseBtn: { padding: 4 },
  modalBtnRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  modalCancelBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.05)", borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" },
  modalCancelText: { color: "#475569", fontSize: 14, fontWeight: "700" },
  sectionHeader: { fontSize: 16, fontWeight: "800", color: "#38BDF8", marginTop: 10, marginBottom: 14 },
  textInput: { borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "rgba(255,255,255,0.7)", fontSize: 14, color: "#0F172A", marginBottom: 12 },
});
