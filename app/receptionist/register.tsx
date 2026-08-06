import React, { useState } from "react";
import {
  Text, StyleSheet, ScrollView, Image, KeyboardAvoidingView,
  Platform, View, TouchableOpacity, SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { register } from "../../src/services/UserService";
import CustomInput from "../../src/components/inputs/CustomInput";
import PasswordInput from "../../src/components/inputs/PasswordInput";
import PrimaryButton from "../../src/components/buttons/PrimaryButton";

export default function ReceptionistRegisterScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("RECEPTIONIST");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({ firstName: "", middleName: "", lastName: "", email: "", phoneNumber: "", password: "" });

  const validateForm = () => {
    let valid = true;
    const newErrors = { firstName: "", middleName: "", lastName: "", email: "", phoneNumber: "", password: "" };

    if (!firstName.trim()) { newErrors.firstName = "First name is required."; valid = false; }
    else if (!/^[A-Za-z]+$/.test(firstName.trim())) { newErrors.firstName = "Only alphabets allowed."; valid = false; }
    else if (firstName.trim().length < 3 || firstName.trim().length > 10) { newErrors.firstName = "3–10 characters required."; valid = false; }

    if (!middleName.trim()) { newErrors.middleName = "Middle name is required."; valid = false; }
    else if (!/^[A-Za-z]+$/.test(middleName.trim())) { newErrors.middleName = "Only alphabets allowed."; valid = false; }
    else if (middleName.trim().length > 10) { newErrors.middleName = "Max 10 characters."; valid = false; }

    if (!lastName.trim()) { newErrors.lastName = "Last name is required."; valid = false; }
    else if (!/^[A-Za-z]+$/.test(lastName.trim())) { newErrors.lastName = "Only alphabets allowed."; valid = false; }
    else if (lastName.trim().length > 10) { newErrors.lastName = "Max 10 characters."; valid = false; }

    if (!email.trim()) { newErrors.email = "Email is required."; valid = false; }
    else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) { newErrors.email = "Enter a valid email."; valid = false; }

    if (!phoneNumber.trim()) { newErrors.phoneNumber = "Phone number is required."; valid = false; }
    else if (!/^[0-9]{10}$/.test(phoneNumber.trim())) { newErrors.phoneNumber = "Must be exactly 10 digits."; valid = false; }

    if (!password.trim()) { newErrors.password = "Password is required."; valid = false; }
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{4,20}$/.test(password)) {
      newErrors.password = "4-20 chars: uppercase, lowercase, number & symbol."; valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (loading) return;
    if (!validateForm()) { Toast.show({ type: "error", text1: "Validation Error", text2: "Please correct the form errors." }); return; }

    try {
      setLoading(true);
      const response = await register({ firstName: firstName.trim(), middleName: middleName.trim(), lastName: lastName.trim(), email: email.trim(), phoneNumber: phoneNumber.trim(), password: password.trim(), role });
      Toast.show({ type: "success", text1: "Receptionist Account Created", text2: response.message || "Account registered!" });
      setTimeout(() => router.replace("/login?role=receptionist"), 1500);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Unable to register.";
      if (message.toLowerCase().includes("email") && message.toLowerCase().includes("exist")) {
        setErrors((prev) => ({ ...prev, email: "Email already exists." }));
      }
      Toast.show({ type: "error", text1: "Registration Failed", text2: message });
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#F8FAFC", "#F1F5F9", "#F3E8FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/login?role=receptionist")} activeOpacity={0.75}>
              <Ionicons name="arrow-back" size={16} color="#64748B" />
              <Text style={styles.backText}>Back to Login</Text>
            </TouchableOpacity>

            <Image source={require("../../src/assets/images/healthnexus-logo.png")} style={styles.logo} resizeMode="contain" />

            <View style={styles.headerSection}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>📋 RECEPTIONIST REGISTRATION</Text>
              </View>
              <Text style={styles.title}>Create Receptionist Account</Text>
              <Text style={styles.subtitle}>Enter your staff credentials</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionHeader}>Account Credentials</Text>
              <CustomInput label="First Name *" placeholder="Enter First Name" value={firstName} onChangeText={(t) => { setFirstName(t); setErrors({ ...errors, firstName: "" }); }} error={errors.firstName} darkTheme={true} />
              <CustomInput label="Middle Name *" placeholder="Enter Middle Name" value={middleName} onChangeText={(t) => { setMiddleName(t); setErrors({ ...errors, middleName: "" }); }} error={errors.middleName} darkTheme={true} />
              <CustomInput label="Last Name *" placeholder="Enter Last Name" value={lastName} onChangeText={(t) => { setLastName(t); setErrors({ ...errors, lastName: "" }); }} error={errors.lastName} darkTheme={true} />
              <CustomInput label="Email *" placeholder="Enter Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={(t) => { setEmail(t); setErrors({ ...errors, email: "" }); }} error={errors.email} darkTheme={true} />
              <CustomInput label="Phone Number *" placeholder="Enter 10-digit Number" keyboardType="phone-pad" maxLength={10} value={phoneNumber} onChangeText={(t) => { setPhoneNumber(t); setErrors({ ...errors, phoneNumber: "" }); }} error={errors.phoneNumber} darkTheme={true} />
              <PasswordInput label="Password *" placeholder="Min 4 chars with Uppercase, Number & Symbol" value={password} onChangeText={(t) => { setPassword(t); setErrors({ ...errors, password: "" }); }} error={errors.password} darkTheme={true} />
              <PrimaryButton title="Create Receptionist Account" onPress={handleRegister} loading={loading} style={styles.registerBtn} />
            </View>

            <TouchableOpacity onPress={() => router.push("/login?role=receptionist")} style={styles.loginLinkBtn} activeOpacity={0.8}>
              <Text style={styles.loginText}>Already registered? <Text style={styles.loginBold}>Sign In</Text></Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC", overflow: "hidden" },
  gradientContainer: { flex: 1 },
  container: { flexGrow: 1, padding: 22, paddingBottom: 40, maxWidth: 560, alignSelf: "center", width: "100%" },
  backButton: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16, alignSelf: "flex-start", backgroundColor: "rgba(0, 0, 0, 0.04)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.08)" },
  backText: { color: "#475569", fontSize: 13, fontWeight: "600" },
  logo: { width: 70, height: 70, alignSelf: "center", marginBottom: 10 },
  headerSection: { alignItems: "center", marginBottom: 18 },
  badgeContainer: { backgroundColor: "rgba(139, 92, 246, 0.1)", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginBottom: 8, borderWidth: 1, borderColor: "rgba(167, 139, 250, 0.5)" },
  badgeText: { color: "#C4B5FD", fontSize: 12, fontWeight: "800" },
  title: { fontSize: 26, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#475569", marginTop: 4 },
  formCard: { backgroundColor: "rgba(255, 255, 255, 0.7)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(167, 139, 250, 0.5)", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8, marginBottom: 20 },
  sectionHeader: { fontSize: 16, fontWeight: "800", color: "#8B5CF6", marginTop: 10, marginBottom: 14 },
  registerBtn: { marginTop: 12, backgroundColor: "#8B5CF6" },
  loginLinkBtn: { alignItems: "center", paddingVertical: 10 },
  loginText: { color: "#64748B", fontSize: 15 },
  loginBold: { color: "#C4B5FD", fontWeight: "700" },
});
