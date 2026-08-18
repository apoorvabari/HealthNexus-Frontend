import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, StatusBar, ActivityIndicator, TextInput, Modal
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

import { getUserSession } from "../../src/storage/AuthStorage";
import { getPatientByAccountId, PatientResponse, createPatientProfile, updatePatientProfile } from "../../src/services/PatientService";
import { getAppointmentsByPatient, AppointmentResponse, createAppointment, deleteAppointment } from "../../src/services/AppointmentService";
import { getAllDoctors, DoctorResponse } from "../../src/services/DoctorService";
import { getAllHospitals, HospitalResponse } from "../../src/services/HospitalService";
import CustomInput from "../../src/components/inputs/CustomInput";
import PrimaryButton from "../../src/components/buttons/PrimaryButton";

export default function PatientHomeScreen() {
  const router = useRouter();

  const [sessionUser, setSessionUser] = useState<any>(null);
  const [profile, setProfile] = useState<PatientResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);

  const [needsProfile, setNeedsProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalResponse[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [patientCode, setPatientCode] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O_POSITIVE");
  const [gender, setGender] = useState("MALE");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDoctorId, setBookingDoctorId] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingReason, setBookingReason] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleLogout = () => {
    router.push("/logout?role=patient");
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const session = await getUserSession();
      setSessionUser(session);

      if (session?.id) {
        try {
          const foundProfile = await getPatientByAccountId(session.id);
          setProfile(foundProfile);
          const patientAppts = await getAppointmentsByPatient(foundProfile.id);
          setAppointments(patientAppts);
          setNeedsProfile(false);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            setNeedsProfile(true);
            const data = await getAllHospitals();
            setHospitals(data.content);
            if (data.content.length > 0) {
              setSelectedHospitalId(data.content[0].id);
            }
          } else {
            throw err;
          }
        }
      }

      const docList = await getAllDoctors();
      setDoctors(docList.content);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Error loading dashboard",
        text2: err?.message || "Failed to load patient history",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (profile) {
      setSelectedHospitalId(profile.hospitalId || (hospitals.length > 0 ? hospitals[0].id : ""));
      setPatientCode(profile.patientCode || "");
      setBloodGroup(profile.bloodGroup || "O_POSITIVE");
      setGender(profile.gender || "MALE");
      setDateOfBirth(profile.dateOfBirth || "");
      setEmergencyContactName(profile.emergencyContactName || "");
      setEmergencyContactPhone(profile.emergencyContactPhone || "");
      setRelationship(profile.relationship || "");
      setAddress(profile.address || "");
      setCity(profile.city || "");
      setState(profile.state || "");
      setPostalCode(profile.postalCode || "");
      setNeedsProfile(true);
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      
      const codeRegex = /^[A-Za-z0-9]+$/;
      const phoneRegex = /^[0-9]{10}$/;
      const postalRegex = /^[0-9]{6}$/;

      if (!selectedHospitalId) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please select a hospital." });
        return;
      }
      if (!patientCode || !patientCode.trim()) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter your patient code." });
        return;
      }
      if (!dateOfBirth || !dateOfBirth.trim()) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter your date of birth." });
        return;
      }
      if (!emergencyContactName || !emergencyContactName.trim()) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter emergency contact name." });
        return;
      }
      if (!emergencyContactPhone || !emergencyContactPhone.trim()) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter emergency contact phone." });
        return;
      }
      if (!relationship || !relationship.trim()) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter relationship with emergency contact." });
        return;
      }
      if (!address || !address.trim()) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter your address." });
        return;
      }
      if (!city || !city.trim()) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter your city." });
        return;
      }
      if (!state || !state.trim()) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter your state." });
        return;
      }
      if (!postalCode || !postalCode.trim()) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Please enter your postal code." });
        return;
      }

      if (patientCode.length < 3 || patientCode.length > 20 || !codeRegex.test(patientCode)) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Patient Code must be 3-20 alphanumeric characters (No hyphens)." });
        return;
      }

      if (!phoneRegex.test(emergencyContactPhone)) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Emergency phone must be exactly 10 digits." });
        return;
      }

      if (!postalRegex.test(postalCode)) {
        Toast.show({ type: "error", text1: "Validation Error", text2: "Postal Code must be exactly 6 digits." });
        return;
      }

      let dateFormatted = dateOfBirth.trim();
      if (dateFormatted.includes("-")) {
        const parts = dateFormatted.split("-");
        if (parts.length === 3) {
          const y = parts[0];
          const m = parts[1].padStart(2, "0");
          const d = parts[2].padStart(2, "0");
          dateFormatted = `${y}-${m}-${d}`;
        }
      }

      const payload = {
        accountId: sessionUser.id,
        hospitalId: selectedHospitalId || undefined,
        patientCode: patientCode.trim(),
        bloodGroup: bloodGroup,
        gender: gender,
        dateOfBirth: dateFormatted,
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        relationship: relationship.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
      };

      if (isEditing && profile) {
        await updatePatientProfile(profile.id, payload);
        Toast.show({ type: "success", text1: "Profile Updated!" });
      } else {
        await createPatientProfile(payload);
        Toast.show({ type: "success", text1: "Profile Created!" });
      }
      setIsEditing(false);
      loadData();
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Error Saving Profile", text2: err?.message || "Please try again." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelAppointment = async (apptId: string) => {
    try {
      setCancellingId(apptId);
      await deleteAppointment(apptId);
      Toast.show({ type: "success", text1: "Appointment Cancelled", text2: "Your appointment has been cancelled." });
      setAppointments(prev => prev.filter(a => a.id !== apptId));
    } catch (err: any) {
      Toast.show({ type: "error", text1: "Cancel Failed", text2: err?.response?.data?.message || err?.message || "Unable to cancel appointment." });
    } finally {
      setCancellingId(null);
    }
  };

  const handleCreateAppointment = async () => {
    if (!profile) return;
    if (!bookingDoctorId) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Please select a doctor." });
      return;
    }
    if (!bookingDate) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Please select an appointment date." });
      return;
    }
    if (!bookingTime) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Please select an appointment time." });
      return;
    }

    try {
      setBookingLoading(true);
      const selectedDoc = doctors.find(d => d.id === bookingDoctorId);

      // Pad date to yyyy-MM-dd if necessary
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

      // Pad time to HH:mm if necessary
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
        patientId: profile.id,
        doctorId: bookingDoctorId,
        hospitalId: selectedDoc?.hospitalId || profile.hospitalId || undefined,
        departmentId: selectedDoc?.departmentId || undefined,
        appointmentDate: dateFormatted,
        appointmentTime: timeFormatted,
        appointmentType: "ONLINE",
        remarks: bookingReason,
      });

      Toast.show({
        type: "success",
        text1: "Appointment Scheduled",
        text2: "Your appointment has been booked successfully!",
      });

      setShowBookingModal(false);
      setBookingDoctorId("");
      setBookingDate("");
      setBookingTime("");
      setBookingReason("");

      loadData();
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

  const getUpcomingCount = () => {
    return appointments.filter(a => a.appointmentStatus === "SCHEDULED" || a.appointmentStatus === "CHECKED_IN").length;
  };

  const getCompletedCount = () => {
    return appointments.filter(a => a.appointmentStatus === "COMPLETED").length;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#34D399" />
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                <Ionicons name="arrow-back" size={20} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity onPress={loadData} style={styles.iconBtn}>
                <Ionicons name="refresh" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.portalBadge}>🩺 PATIENT PORTAL</Text>
              <Text style={styles.welcomeTitle}>
                {profile ? `${profile.accountName} 🩺` : "Patient 👋"}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          {profile && (
            <View style={styles.profileMeta}>
              <Text style={styles.metaText}>Code: {profile.patientCode}</Text>
              <Text style={styles.metaText}>Blood: {profile.bloodGroup}</Text>
              <Text style={styles.metaText}>Gender: {profile.gender}</Text>
            </View>
          )}

          {needsProfile ? (
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Complete Your Profile</Text>
              <Text style={[styles.emptyText, { marginBottom: 16 }]}>Please fill in your medical and contact details to proceed.</Text>
              
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.fieldLabel}>Select Hospital *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker selectedValue={selectedHospitalId} onValueChange={setSelectedHospitalId} dropdownIconColor="#64748B" style={{ color: "#0F172A", height: 50, borderWidth: 0, backgroundColor: "transparent", outlineStyle: 'none' } as any}>
                    {hospitals.map(h => <Picker.Item key={h.id} label={h.hospitalName} value={h.id} color="#0F172A" />)}
                  </Picker>
                </View>
              </View>

              <CustomInput label="Patient Code (Alphanumeric only) *" placeholder="e.g. PAT101" value={patientCode} onChangeText={setPatientCode} maxLength={20} darkTheme={true} />

              <View style={{ marginBottom: 16 }}>
                <Text style={styles.fieldLabel}>Blood Group *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker selectedValue={bloodGroup} onValueChange={setBloodGroup} dropdownIconColor="#64748B" style={{ color: "#0F172A", height: 50, borderWidth: 0, backgroundColor: "transparent", outlineStyle: 'none' } as any}>
                    <Picker.Item label="O Positive" value="O_POSITIVE" color="#0F172A" />
                    <Picker.Item label="O Negative" value="O_NEGATIVE" color="#0F172A" />
                    <Picker.Item label="A Positive" value="A_POSITIVE" color="#0F172A" />
                    <Picker.Item label="A Negative" value="A_NEGATIVE" color="#0F172A" />
                    <Picker.Item label="B Positive" value="B_POSITIVE" color="#0F172A" />
                    <Picker.Item label="B Negative" value="B_NEGATIVE" color="#0F172A" />
                    <Picker.Item label="AB Positive" value="AB_POSITIVE" color="#0F172A" />
                    <Picker.Item label="AB Negative" value="AB_NEGATIVE" color="#0F172A" />
                  </Picker>
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={styles.fieldLabel}>Gender *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker selectedValue={gender} onValueChange={setGender} dropdownIconColor="#64748B" style={{ color: "#0F172A", height: 50, borderWidth: 0, backgroundColor: "transparent", outlineStyle: 'none' } as any}>
                    <Picker.Item label="Male" value="MALE" color="#0F172A" />
                    <Picker.Item label="Female" value="FEMALE" color="#0F172A" />
                    <Picker.Item label="Other" value="OTHER" color="#0F172A" />
                  </Picker>
                </View>
              </View>

              <CustomInput label="Date of Birth *" value={dateOfBirth} onChangeText={setDateOfBirth} darkTheme={true} {...{ type: "date" } as any} />
              
              <View style={styles.formDivider} />
              <Text style={styles.sectionHeader}>Emergency Contact</Text>
              <CustomInput label="Name *" placeholder="Full Name" value={emergencyContactName} onChangeText={setEmergencyContactName} darkTheme={true} />
              <CustomInput label="Phone *" placeholder="10-digit number" value={emergencyContactPhone} onChangeText={setEmergencyContactPhone} keyboardType="phone-pad" maxLength={10} darkTheme={true} />
              <CustomInput label="Relationship *" placeholder="e.g. Parent, Spouse" value={relationship} onChangeText={setRelationship} darkTheme={true} />
              
              <View style={styles.formDivider} />
              <Text style={styles.sectionHeader}>Address Details</Text>
              <Text style={styles.fieldLabel}>Street Address *</Text>
              <TextInput style={styles.textInput} placeholder="House/Street" placeholderTextColor="#94A3B8" value={address} onChangeText={setAddress} />
              <Text style={styles.fieldLabel}>City *</Text>
              <TextInput style={styles.textInput} placeholder="City" placeholderTextColor="#94A3B8" value={city} onChangeText={setCity} />
              <Text style={styles.fieldLabel}>State *</Text>
              <TextInput style={styles.textInput} placeholder="State" placeholderTextColor="#94A3B8" value={state} onChangeText={setState} />
              <Text style={styles.fieldLabel}>Postal Code (6 digits) *</Text>
              <TextInput style={styles.textInput} placeholder="Postal Code" placeholderTextColor="#94A3B8" value={postalCode} onChangeText={setPostalCode} keyboardType="numeric" maxLength={6} />

              <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
                <PrimaryButton title="Save Profile" onPress={handleSaveProfile} loading={savingProfile} style={{ flex: 1 }} />
                {isEditing && (
                  <TouchableOpacity style={[styles.cancelBtn, { flex: 1, justifyContent: "center" }]} onPress={() => { setNeedsProfile(false); setIsEditing(false); }}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <>
              <View style={styles.summaryCard}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{getUpcomingCount()}</Text>
                  <Text style={styles.statLabel}>Upcoming Visits</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{getCompletedCount()}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.bookAppointmentBtn}
                onPress={() => setShowBookingModal(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.bookAppointmentBtnText}>➕ Book Appointment</Text>
              </TouchableOpacity>

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>My Appointment Records</Text>
                <TouchableOpacity style={styles.editProfileBtn} onPress={handleEditProfile} activeOpacity={0.8}>
                  <Ionicons name="pencil-outline" size={14} color="#34D399" />
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>

              {appointments.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No appointments booked yet.</Text>
                </View>
              ) : (
                <View style={styles.listContainer}>
                  {appointments.map((appt) => (
                    <View key={appt.id} style={styles.apptCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.doctorName}>Dr. {appt.doctorName}</Text>
                        <Text style={[styles.apptStatus, appt.appointmentStatus === "CANCELLED" ? styles.apptStatusCancelled : appt.appointmentStatus === "COMPLETED" ? styles.apptStatusCompleted : {}]}>
                          {appt.appointmentStatus}
                        </Text>
                      </View>
                      <Text style={styles.deptName}>{appt.departmentName} • {appt.hospitalName}</Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.dateText}>📅 {appt.appointmentDate}</Text>
                        <Text style={styles.timeText}>⏰ {appt.appointmentTime}</Text>
                      </View>
                      {(appt.appointmentStatus === "SCHEDULED" || appt.appointmentStatus === "CHECKED_IN") && (
                        <TouchableOpacity
                          style={styles.cancelApptBtn}
                          onPress={() => handleCancelAppointment(appt.id)}
                          disabled={cancellingId === appt.id}
                          activeOpacity={0.8}
                        >
                          {cancellingId === appt.id
                            ? <ActivityIndicator size="small" color="#EF4444" />
                            : <Text style={styles.cancelApptBtnText}>✕ Cancel Appointment</Text>
                          }
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}
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
                <Text style={styles.modalTitle}>Book Appointment</Text>
                <TouchableOpacity
                  onPress={() => setShowBookingModal(false)}
                  style={styles.modalCloseIconBtn}
                >
                  <Ionicons name="close" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalSubtitle}>Schedule a consultation with a doctor.</Text>

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
                label="Appointment Date *"
                placeholder="YYYY-MM-DD"
                value={bookingDate}
                onChangeText={setBookingDate}
                darkTheme={true}
                {...{ type: "date" } as any}
              />

              <CustomInput
                label="Appointment Time *"
                placeholder="HH:MM"
                value={bookingTime}
                onChangeText={setBookingTime}
                darkTheme={true}
                {...{ type: "time" } as any}
              />

              <CustomInput
                label="Reason for Visit"
                placeholder="e.g. Regular Checkup"
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
                  title="Confirm Booking"
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
    borderColor: "rgba(52, 211, 153, 0.5)",
    marginBottom: 20,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 6,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  portalBadge: { fontSize: 12, fontWeight: "800", color: "#34D399", marginBottom: 4, letterSpacing: 0.5 },
  welcomeTitle: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  userEmail: { fontSize: 13, color: "#475569", marginTop: 2 },
  profileMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  metaText: { fontSize: 12, backgroundColor: "rgba(16, 185, 129, 0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, color: "#34D399", fontWeight: "700", borderWidth: 1, borderColor: "rgba(52, 211, 153, 0.3)" },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0, 0, 0, 0.04)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.08)" },
  logoutText: { fontSize: 13, fontWeight: "700", color: "#0284C7" },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 20,
    padding: 20,
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(52, 211, 153, 0.5)",
    marginBottom: 24,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 4,
  },
  statBox: { alignItems: "center" },
  statNum: { fontSize: 28, fontWeight: "800", color: "#34D399" },
  statLabel: { fontSize: 12, color: "#64748B", marginTop: 2, fontWeight: "600" },
  statDivider: { width: 1, height: 32, backgroundColor: "rgba(0, 0, 0, 0.05)" },
  sectionHeaderRow: { marginBottom: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A", letterSpacing: -0.3 },
  editProfileBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(16, 185, 129, 0.1)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "rgba(52, 211, 153, 0.3)" },
  editProfileText: { fontSize: 12, fontWeight: "700", color: "#34D399" },
  emptyCard: { backgroundColor: "rgba(255, 255, 255, 0.7)", borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)" },
  emptyText: { color: "#64748B", fontSize: 14 },
  listContainer: { gap: 14 },
  apptCard: { backgroundColor: "rgba(255, 255, 255, 0.7)", borderRadius: 18, padding: 18, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  doctorName: { fontSize: 17, fontWeight: "800", color: "#0F172A" },
  apptStatus: { fontSize: 12, fontWeight: "800", color: "#34D399", backgroundColor: "rgba(16, 185, 129, 0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "rgba(52, 211, 153, 0.3)" },
  deptName: { fontSize: 13, color: "#475569", marginBottom: 12 },
  metaRow: { flexDirection: "row", gap: 16, marginTop: 4 },
  dateText: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  timeText: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  cancelApptBtn: { marginTop: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.4)", borderRadius: 10, paddingVertical: 8, alignItems: "center", backgroundColor: "rgba(239,68,68,0.06)" },
  cancelApptBtnText: { color: "#EF4444", fontSize: 13, fontWeight: "700" },
  apptStatusCancelled: { color: "#EF4444", backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)" },
  apptStatusCompleted: { color: "#34D399", backgroundColor: "rgba(16,185,129,0.1)", borderColor: "rgba(52,211,153,0.3)" },
  formCard: { backgroundColor: "rgba(255, 255, 255, 0.7)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(52, 211, 153, 0.5)", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8, marginBottom: 20 },
  sectionHeader: { fontSize: 16, fontWeight: "800", color: "#34D399", marginTop: 10, marginBottom: 14 },
  formDivider: { height: 1, backgroundColor: "rgba(0, 0, 0, 0.05)", marginVertical: 18 },
  fieldLabel: { fontSize: 14, fontWeight: "600", color: "#334155", marginBottom: 6 },
  pickerWrapper: { borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)", borderRadius: 12, backgroundColor: "rgba(255, 255, 255, 0.7)", overflow: "hidden", height: 50, justifyContent: "center" },
  textInput: { borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "rgba(255, 255, 255, 0.7)", fontSize: 14, color: "#0F172A", marginBottom: 12 },
  cancelBtn: { marginTop: 12, alignItems: "center", paddingVertical: 12 },
  cancelBtnText: { color: "#64748B", fontWeight: "600", fontSize: 15 },
  bookAppointmentBtn: { backgroundColor: "#34D399", paddingVertical: 14, borderRadius: 16, alignItems: "center", marginBottom: 20, shadowColor: "#34D399", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 6 },
  bookAppointmentBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700", letterSpacing: 0.3 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.4)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  modalContainer: { backgroundColor: "rgba(255, 255, 255, 0.95)", borderRadius: 24, padding: 24, width: "100%", maxWidth: 460, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 12 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalCloseIconBtn: { padding: 4 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A", marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: "#475569", marginBottom: 16 },
  modalButtonRow: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 12, marginTop: 18 },
  modalCancelBtn: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14, backgroundColor: "rgba(0, 0, 0, 0.05)", borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)" },
  modalCancelText: { color: "#475569", fontSize: 14, fontWeight: "700" },
  modalSubmitBtn: { backgroundColor: "#34D399", paddingHorizontal: 20 },
});
