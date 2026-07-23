import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { register } from "../../src/services/AccountService";
import RolePicker from "../../src/components/dropdowns/RolePicker";
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
  const [role] = useState("PATIENT"); // Pre-set role
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
    };

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required.";
      valid = false;
    } else if (!/^[A-Za-z]+$/.test(firstName.trim())) {
      newErrors.firstName = "Only alphabets are allowed.";
      valid = false;
    } else if (firstName.trim().length < 3 || firstName.trim().length > 10) {
      newErrors.firstName = "First name must be 3–10 characters.";
      valid = false;
    }

    if (!middleName.trim()) {
      newErrors.middleName = "Middle name is required.";
      valid = false;
    } else if (!/^[A-Za-z]+$/.test(middleName.trim())) {
      newErrors.middleName = "Only alphabets are allowed.";
      valid = false;
    } else if (middleName.trim().length < 1 || middleName.trim().length > 10) {
      newErrors.middleName = "Middle name must be 1–10 characters.";
      valid = false;
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required.";
      valid = false;
    } else if (!/^[A-Za-z]+$/.test(lastName.trim())) {
      newErrors.lastName = "Only alphabets are allowed.";
      valid = false;
    } else if (lastName.trim().length < 1 || lastName.trim().length > 10) {
      newErrors.lastName = "Last name must be 1–10 characters.";
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
      valid = false;
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
      valid = false;
    } else if (!/^[0-9]{10}$/.test(phoneNumber.trim())) {
      newErrors.phoneNumber = "Phone number must be exactly 10 digits.";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{4,8}$/.test(password)) {
      newErrors.password = "4-8 chars: uppercase, lowercase, number & symbol.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (loading) return;
    if (!validateForm()) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Please correct the form errors." });
      return;
    }

    try {
      setLoading(true);
      const response = await register({
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password: password.trim(),
        role,
      });

      Toast.show({ type: "success", text1: "Account Created", text2: response.message || "Patient account registered!" });
      setTimeout(() => router.replace("/patient/login"), 1500);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Unable to register.";
      if (message.toLowerCase().includes("email") && message.toLowerCase().includes("exist")) {
        setErrors((prev) => ({ ...prev, email: "Email already exists." }));
      }
      Toast.show({ type: "error", text1: "Registration Failed", text2: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push("/patient/login")}>
            <Text style={styles.backText}>← Back to Login</Text>
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
            <CustomInput label="First Name *" placeholder="Enter First Name" value={firstName}
              onChangeText={(t) => { setFirstName(t); setErrors({ ...errors, firstName: "" }); }} error={errors.firstName} />
            <CustomInput label="Middle Name *" placeholder="Enter Middle Name" value={middleName}
              onChangeText={(t) => { setMiddleName(t); setErrors({ ...errors, middleName: "" }); }} error={errors.middleName} />
            <CustomInput label="Last Name *" placeholder="Enter Last Name" value={lastName}
              onChangeText={(t) => { setLastName(t); setErrors({ ...errors, lastName: "" }); }} error={errors.lastName} />
            <CustomInput label="Email *" placeholder="Enter Email" keyboardType="email-address" autoCapitalize="none"
              value={email} onChangeText={(t) => { setEmail(t); setErrors({ ...errors, email: "" }); }} error={errors.email} />
            <CustomInput label="Phone Number *" placeholder="Enter 10-digit Number" keyboardType="phone-pad" maxLength={10}
              value={phoneNumber} onChangeText={(t) => { setPhoneNumber(t); setErrors({ ...errors, phoneNumber: "" }); }} error={errors.phoneNumber} />
            <PasswordInput label="Password *" placeholder="Min 4 chars with Uppercase, Number & Symbol"
              value={password} onChangeText={(t) => { setPassword(t); setErrors({ ...errors, password: "" }); }} error={errors.password} />

            <PrimaryButton title="Create Patient Account" onPress={handleRegister} loading={loading} style={styles.registerBtn} />
          </View>

          <TouchableOpacity onPress={() => router.push("/patient/login")} style={styles.loginLinkBtn}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginBold}>Sign In</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F9FF" },
  container: { flexGrow: 1, padding: 22, paddingBottom: 40 },
  backButton: { marginBottom: 10 },
  backText: { color: "#0284C7", fontSize: 15, fontWeight: "600" },
  logo: { width: 70, height: 70, alignSelf: "center", marginBottom: 10 },
  headerSection: { alignItems: "center", marginBottom: 18 },
  badgeContainer: { backgroundColor: "#E0F2FE", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginBottom: 8 },
  badgeText: { color: "#0284C7", fontSize: 12, fontWeight: "800" },
  title: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  subtitle: { fontSize: 13, color: "#64748B", marginTop: 4 },
  formCard: {
    backgroundColor: "#FFFFFF", borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: "#BAE6FD",
    shadowColor: "#0284C7", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
    marginBottom: 20,
  },
  registerBtn: { marginTop: 8, backgroundColor: "#0284C7" },
  loginLinkBtn: { alignItems: "center" },
  loginText: { color: "#64748B", fontSize: 15 },
  loginBold: { color: "#0284C7", fontWeight: "700" },
});
