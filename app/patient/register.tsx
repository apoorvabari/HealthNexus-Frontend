import React, { useState, useEffect } from "react";
import {
  Text, StyleSheet, ScrollView, Image, KeyboardAvoidingView,
  Platform, View, TouchableOpacity, SafeAreaView, TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { register } from "../../src/services/UserService";
import CustomInput from "../../src/components/inputs/CustomInput";
import PasswordInput from "../../src/components/inputs/PasswordInput";
import PrimaryButton from "../../src/components/buttons/PrimaryButton";

export default function PatientRegisterScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("PATIENT");

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const handleRegister = async () => {
    let valid = true;
    const errs = {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
    };

    if (!firstName.trim()) { errs.firstName = "First Name is required."; valid = false; }
    if (!middleName.trim()) { errs.middleName = "Middle Name is required."; valid = false; }
    if (!lastName.trim()) { errs.lastName = "Last Name is required."; valid = false; }
    if (!email.trim()) {
      errs.email = "Email is required."; valid = false;
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim())) {
      errs.email = "Enter a valid email address."; valid = false;
    }
    if (!phoneNumber.trim()) {
      errs.phoneNumber = "Phone Number is required."; valid = false;
    } else if (!/^\d{10}$/.test(phoneNumber.trim())) {
      errs.phoneNumber = "Phone Number must be exactly 10 digits."; valid = false;
    }
    if (!password.trim()) {
      errs.password = "Password is required."; valid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{4,20}$/.test(password)) {
      errs.password = "Min 4 chars with Uppercase, Lowercase, Number & Symbol."; valid = false;
    }



    setErrors(errs);

    if (!valid) {
      Toast.show({
        type: "error",
        text1: "Validation Failure",
        text2: "Please correct highlighted errors in the form.",
      });
      return;
    }

    try {
      setLoading(true);

      const userRes = await register({
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password: password,
        role: role,
      });

      Toast.show({
        type: "success",
        text1: "Registration Successful",
        text2: "Account created! Please Sign In.",
      });

      setTimeout(() => {
        router.replace("/login?role=patient");
      }, 1500);

    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Registration failed. Try again.";
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: msg,
      });
    } finally {
      setLoading(false);
    }
  };



  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#F8FAFC", "#F1F5F9", "#E2E8F0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.push("/login?role=patient")} activeOpacity={0.75}>
              <Ionicons name="arrow-back" size={16} color="#64748B" />
              <Text style={styles.backText}>Back to Login</Text>
            </TouchableOpacity>

            <Image
              source={require("../../src/assets/images/healthnexus-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <View style={styles.headerSection}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>🩺 PATIENT REGISTRATION</Text>
              </View>
              <Text style={styles.title}>Create Patient Account</Text>
              <Text style={styles.subtitle}>Fill in your details to register</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionHeader}>Account Credentials</Text>
              <CustomInput label="First Name *" placeholder="Enter First Name" value={firstName}
                onChangeText={(t) => { setFirstName(t); setErrors({ ...errors, firstName: "" }); }} error={errors.firstName} darkTheme={true} />
              <CustomInput label="Middle Name *" placeholder="Enter Middle Name" value={middleName}
                onChangeText={(t) => { setMiddleName(t); setErrors({ ...errors, middleName: "" }); }} error={errors.middleName} darkTheme={true} />
              <CustomInput label="Last Name *" placeholder="Enter Last Name" value={lastName}
                onChangeText={(t) => { setLastName(t); setErrors({ ...errors, lastName: "" }); }} error={errors.lastName} darkTheme={true} />
              <CustomInput label="Email *" placeholder="Enter Email" keyboardType="email-address" autoCapitalize="none"
                value={email} onChangeText={(t) => { setEmail(t); setErrors({ ...errors, email: "" }); }} error={errors.email} darkTheme={true} />
              <CustomInput label="Phone Number *" placeholder="Enter 10-digit Number" keyboardType="phone-pad" maxLength={10}
                value={phoneNumber} onChangeText={(t) => { setPhoneNumber(t); setErrors({ ...errors, phoneNumber: "" }); }} error={errors.phoneNumber} darkTheme={true} />
              <PasswordInput label="Password *" placeholder="Min 4 chars with Uppercase, Number & Symbol"
                value={password} onChangeText={(t) => { setPassword(t); setErrors({ ...errors, password: "" }); }} error={errors.password} darkTheme={true} />



              <PrimaryButton title="Create Patient Account" onPress={handleRegister} loading={loading} style={styles.registerBtn} />
            </View>

            <TouchableOpacity onPress={() => router.push("/login?role=patient")} style={styles.loginLinkBtn} activeOpacity={0.8}>
              <Text style={styles.loginText}>Already have an account? <Text style={styles.loginBold}>Sign In</Text></Text>
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
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F8FAFC" },
  backButton: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16, alignSelf: "flex-start", backgroundColor: "rgba(0, 0, 0, 0.04)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.08)" },
  backText: { color: "#475569", fontSize: 13, fontWeight: "600" },
  logo: { width: 70, height: 70, alignSelf: "center", marginBottom: 10 },
  headerSection: { alignItems: "center", marginBottom: 18 },
  badgeContainer: { backgroundColor: "rgba(16, 185, 129, 0.1)", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginBottom: 8, borderWidth: 1, borderColor: "rgba(52, 211, 153, 0.5)" },
  badgeText: { color: "#34D399", fontSize: 12, fontWeight: "800" },
  title: { fontSize: 26, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#475569", marginTop: 4 },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)", borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: "rgba(52, 211, 153, 0.5)",
    shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
    marginBottom: 20,
  },
  sectionHeader: { fontSize: 16, fontWeight: "800", color: "#34D399", marginTop: 10, marginBottom: 14 },
  formDivider: { height: 1, backgroundColor: "rgba(0, 0, 0, 0.05)", marginVertical: 18 },
  registerBtn: { marginTop: 18, backgroundColor: "#10B981" },
  loginLinkBtn: { alignItems: "center", paddingVertical: 10 },
  loginText: { color: "#64748B", fontSize: 15 },
  loginBold: { color: "#34D399", fontWeight: "700" },
  fieldLabel: { fontSize: 14, fontWeight: "700", color: "#334155", marginTop: 10, marginBottom: 6 },
  pickerWrapper: { borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)", borderRadius: 12, backgroundColor: "rgba(255, 255, 255, 0.7)", overflow: "hidden", marginBottom: 12 },
  textInput: { borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.1)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "rgba(255, 255, 255, 0.7)", fontSize: 14, color: "#0F172A", marginBottom: 12 },
  errorText: { color: "#F87171", fontSize: 12, marginTop: -4, marginBottom: 8, fontWeight: "600" },
});
