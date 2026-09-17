import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";

import CustomInput from "../../src/components/inputs/CustomInput";
import PrimaryButton from "../../src/components/buttons/PrimaryButton";
import { registerWalkInPatient } from "../../src/services/ReceptionistService";

export default function RegisterWalkInPatientScreen() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const validate = () => {
    if (!firstName.trim() || !lastName.trim())
      return "First name and last name are required.";
    if (!email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Enter a valid email.";
    if (!/^\d{10}$/.test(phoneNumber.trim())) return "Phone must be 10 digits.";
    if (password.length < 4) return "Password must contain at least 4 characters.";
    if (!dateOfBirth.trim()) return "Date of birth is required.";
    if (!gender) return "Select gender.";
    if (!bloodGroup) return "Select blood group.";
    if (!emergencyContactName.trim()) return "Emergency contact name is required.";
    if (!/^\d{10}$/.test(emergencyContactPhone.trim()))
      return "Emergency contact phone must be 10 digits.";
    if (!relationship.trim()) return "Emergency contact relationship is required.";
    if (!address.trim() || !city.trim() || !state.trim())
      return "Complete address is required.";
    if (!/^\d{6}$/.test(postalCode.trim())) return "Postal code must be 6 digits.";
    return null;
  };

  const handleRegister = async () => {
    const error = validate();
    if (error) {
      Toast.show({ type: "error", text1: "Validation Error", text2: error });
      return;
    }

    try {
      setSaving(true);

      const patient = await registerWalkInPatient({
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        phoneNumber: phoneNumber.trim(),
        bloodGroup,
        gender,
        dateOfBirth: dateOfBirth.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        relationship: relationship.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
      });

      Toast.show({
        type: "success",
        text1: "Patient Registered",
        text2: `${patient.accountName || firstName} is now registered in your hospital.`,
      });
      router.back();
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2:
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to register patient.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <LinearGradient
        colors={["#F8FAFC", "#F1F5F9", "#F3E8FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#64748B" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.badge}>RECEPTION DESK</Text>
              <Text style={styles.title}>Register Walk-in Patient</Text>
              <Text style={styles.subtitle}>
                Creates a patient account and patient profile under your hospital.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <CustomInput label="First Name *" value={firstName} onChangeText={setFirstName} placeholder="First name" darkTheme />
            <CustomInput label="Middle Name *" value={middleName} onChangeText={setMiddleName} placeholder="Middle name" darkTheme />
            <CustomInput label="Last Name *" value={lastName} onChangeText={setLastName} placeholder="Last name" darkTheme />
            <CustomInput label="Email *" value={email} onChangeText={setEmail} placeholder="patient@example.com" keyboardType="email-address" autoCapitalize="none" darkTheme />
            <CustomInput label="Phone Number *" value={phoneNumber} onChangeText={setPhoneNumber} placeholder="10 digit phone number" keyboardType="phone-pad" maxLength={10} darkTheme />
            <CustomInput label="Initial Password *" value={password} onChangeText={setPassword} placeholder="Minimum 4 characters" secureTextEntry darkTheme />

            <Text style={styles.sectionTitle}>Patient Information</Text>
            <CustomInput label="Date of Birth *" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="YYYY-MM-DD" isDate darkTheme />

            <Text style={styles.label}>Gender *</Text>
            <View style={styles.picker}>
              <Picker selectedValue={gender} onValueChange={setGender}>
                <Picker.Item label="-- Select Gender --" value="" />
                <Picker.Item label="Male" value="MALE" />
                <Picker.Item label="Female" value="FEMALE" />
                <Picker.Item label="Other" value="OTHER" />
              </Picker>
            </View>

            <Text style={styles.label}>Blood Group *</Text>
            <View style={styles.picker}>
              <Picker selectedValue={bloodGroup} onValueChange={setBloodGroup}>
                <Picker.Item label="-- Select Blood Group --" value="" />
                {['A_POSITIVE','A_NEGATIVE','B_POSITIVE','B_NEGATIVE','AB_POSITIVE','AB_NEGATIVE','O_POSITIVE','O_NEGATIVE'].map(v => (
                  <Picker.Item key={v} label={v.replace('_', ' ').replace('POSITIVE', '+').replace('NEGATIVE', '-')} value={v} />
                ))}
              </Picker>
            </View>

            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <CustomInput label="Contact Name *" value={emergencyContactName} onChangeText={setEmergencyContactName} placeholder="Emergency contact name" darkTheme />
            <CustomInput label="Contact Phone *" value={emergencyContactPhone} onChangeText={setEmergencyContactPhone} placeholder="10 digit phone number" keyboardType="phone-pad" maxLength={10} darkTheme />
            <CustomInput label="Relationship *" value={relationship} onChangeText={setRelationship} placeholder="e.g. Father, Mother, Spouse" darkTheme />

            <Text style={styles.sectionTitle}>Address</Text>
            <CustomInput label="Address *" value={address} onChangeText={setAddress} placeholder="House / Street / Area" multiline darkTheme />
            <CustomInput label="City *" value={city} onChangeText={setCity} placeholder="City" darkTheme />
            <CustomInput label="State *" value={state} onChangeText={setState} placeholder="State" darkTheme />
            <CustomInput label="Postal Code *" value={postalCode} onChangeText={setPostalCode} placeholder="6 digit postal code" keyboardType="number-pad" maxLength={6} darkTheme />

            <View style={styles.securityNote}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#7C3AED" />
              <Text style={styles.securityText}>
                Hospital assignment is controlled by the backend tenant context. The receptionist cannot choose another hospital.
              </Text>
            </View>

            <PrimaryButton title="Register Patient" onPress={handleRegister} loading={saving} style={{ backgroundColor: "#8B5CF6", marginTop: 8 }} />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  gradient: { flex: 1 },
  content: { padding: 20, maxWidth: 640, width: "100%", alignSelf: "center" },
  header: { flexDirection: "row", gap: 14, alignItems: "center", marginBottom: 18 },
  backBtn: { padding: 9, borderRadius: 10, backgroundColor: "rgba(255,255,255,.7)", borderWidth: 1, borderColor: "rgba(0,0,0,.08)" },
  badge: { fontSize: 11, fontWeight: "800", color: "#7C3AED", marginBottom: 3, letterSpacing: .6 },
  title: { fontSize: 25, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 3 },
  card: { backgroundColor: "rgba(255,255,255,.78)", borderRadius: 22, padding: 20, borderWidth: 1, borderColor: "rgba(167,139,250,.45)" },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#0F172A", marginTop: 8, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: "#334155", marginBottom: 6 },
  picker: { height: 52, borderRadius: 12, borderWidth: 1, borderColor: "rgba(0,0,0,.1)", backgroundColor: "rgba(255,255,255,.7)", overflow: "hidden", justifyContent: "center", marginBottom: 16 },
  securityNote: { flexDirection: "row", gap: 9, padding: 12, borderRadius: 12, backgroundColor: "rgba(124,58,237,.08)", borderWidth: 1, borderColor: "rgba(124,58,237,.18)", marginBottom: 14 },
  securityText: { flex: 1, fontSize: 12, lineHeight: 18, color: "#5B21B6" },
});
