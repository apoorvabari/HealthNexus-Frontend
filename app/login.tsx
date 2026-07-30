import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Toast from "react-native-toast-message";

import CustomInput from "../src/components/inputs/CustomInput";
import PasswordInput from "../src/components/inputs/PasswordInput";
import PrimaryButton from "../src/components/buttons/PrimaryButton";
import { login, resetPassword } from "../src/services/AccountService";

type PortalType = "patient" | "doctor" | "receptionist";

const PORTAL_CONFIG = {
  patient: {
    badgeIcon: "🩺",
    badgeText: "PATIENT PORTAL",
    title: "Patient Sign In",
    subtitle: "Access your medical history, doctors & appointments",
    emailLabel: "Patient Email",
    themeColor: "#0284C7",
    bgColor: "#F0F9FF",
    borderColor: "#BAE6FD",
    registerRoute: "/patient/register",
    registerText: "New Patient? ",
    badgeBg: "#E0F2FE",
  },
  doctor: {
    badgeIcon: "👨‍⚕️",
    badgeText: "DOCTOR PORTAL",
    title: "Doctor Sign In",
    subtitle: "Manage daily schedules, consult patients & write electronic prescriptions",
    emailLabel: "Doctor Email",
    themeColor: "#059669",
    bgColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    registerRoute: "/doctor/register",
    registerText: "New Doctor? ",
    badgeBg: "#D1FAE5",
  },
  receptionist: {
    badgeIcon: "📋",
    badgeText: "RECEPTIONIST PORTAL",
    title: "Receptionist Sign In",
    subtitle: "Handle front desk check-ins, register walk-ins & schedule doctor slots",
    emailLabel: "Receptionist Email",
    themeColor: "#4F46E5",
    bgColor: "#EEF2FF",
    borderColor: "#C7D2FE",
    registerRoute: "/receptionist/register",
    registerText: "New Receptionist? ",
    badgeBg: "#E0E7FF",
  },
  default: {
    badgeIcon: "🩺",
    badgeText: "HEALTHNEX ACCESS",
    title: "Account Sign In",
    subtitle: "Enter your credentials to access your portal",
    emailLabel: "Email Address",
    themeColor: "#0D6EFD",
    bgColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    registerRoute: "/select-portal",
    registerText: "No account? ",
    badgeBg: "#EFF6FF",
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const portalParam = (params.portal as string)?.toLowerCase() as PortalType;
  const config = PORTAL_CONFIG[portalParam] || PORTAL_CONFIG.default;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetErrors, setResetErrors] = useState({ email: "", newPassword: "", confirmPassword: "" });

  const handleResetPassword = async () => {
    let valid = true;
    const newErrors = { email: "", newPassword: "", confirmPassword: "" };

    if (!resetEmail.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(resetEmail.trim())) {
      newErrors.email = "Enter a valid email address.";
      valid = false;
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required.";
      valid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{4,8}$/.test(newPassword)) {
      newErrors.newPassword = "4-8 chars: uppercase, lowercase, number & symbol.";
      valid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required.";
      valid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
      valid = false;
    }

    setResetErrors(newErrors);

    if (!valid) return;

    try {
      setResetLoading(true);
      await resetPassword({
        email: resetEmail.trim(),
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });

      Toast.show({
        type: "success",
        text1: "Password Reset Success",
        text2: "Your password has been reset successfully.",
      });

      setResetEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setShowResetModal(false);
    } catch (error: any) {
      const message =
        typeof error?.response?.data === "string"
          ? error.response.data
          : error?.response?.data?.message || error?.message || "Unable to reset password.";
      Toast.show({
        type: "error",
        text1: "Reset Failed",
        text2: message,
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address.";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please correct the highlighted fields.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await login({
        email: email.trim(),
        password: password.trim(),
      });

      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: response.message || "Welcome back to HealthNexus!",
      });

      setTimeout(() => {
        const userRole = response.role ? response.role.toUpperCase() : "PATIENT";
        if (userRole === "DOCTOR") {
          router.replace("/doctor/home");
        } else if (userRole === "RECEPTIONIST") {
          router.replace("/receptionist/home");
        } else {
          router.replace("/patient/home");
        }
      }, 1000);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to login. Please try again.";
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: config.bgColor }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/select-portal")}
          >
            <Text style={[styles.backText, { color: config.themeColor }]}>← Choose Portal</Text>
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <View style={[styles.badgeContainer, { backgroundColor: config.badgeBg }]}>
              <Text style={styles.badgeIcon}>{config.badgeIcon}</Text>
              <Text style={[styles.badgeText, { color: config.themeColor }]}>{config.badgeText}</Text>
            </View>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.subtitle}>{config.subtitle}</Text>
          </View>

          <View style={[styles.formCard, { borderColor: config.borderColor }]}>
            <CustomInput
              label={config.emailLabel}
              placeholder="Enter your email"
              value={email}
              onChangeText={(t: string) => { setEmail(t); setErrors({ ...errors, email: "" }); }}
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(t: string) => { setPassword(t); setErrors({ ...errors, password: "" }); }}
              error={errors.password}
            />

            <TouchableOpacity onPress={() => setShowResetModal(true)} style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: config.themeColor }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <PrimaryButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              style={[styles.loginBtn, { backgroundColor: config.themeColor }]}
            />
          </View>

          <View style={styles.footerSection}>
            <TouchableOpacity onPress={() => router.push(config.registerRoute as any)}>
              <Text style={styles.registerText}>
                {config.registerText}<Text style={[styles.registerBold, { color: config.themeColor }]}>Register Here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showResetModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <TouchableOpacity onPress={() => setShowResetModal(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <CustomInput
                label="Registered Email Address"
                placeholder="Enter your registered email"
                value={resetEmail}
                onChangeText={(t: string) => { setResetEmail(t); setResetErrors({ ...resetErrors, email: "" }); }}
                autoCapitalize="none"
                keyboardType="email-address"
                error={resetErrors.email}
                autoComplete="off"
                importantForAutofill="no"
                textContentType="none"
              />

              <PasswordInput
                label="New Password"
                placeholder="Min 4 chars with Uppercase, Number & Symbol"
                value={newPassword}
                onChangeText={(t: string) => { setNewPassword(t); setResetErrors({ ...resetErrors, newPassword: "" }); }}
                error={resetErrors.newPassword}
              />

              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={(t: string) => { setConfirmPassword(t); setResetErrors({ ...resetErrors, confirmPassword: "" }); }}
                error={resetErrors.confirmPassword}
              />

              <PrimaryButton
                title="Reset Password"
                onPress={handleResetPassword}
                loading={resetLoading}
                style={[styles.modalSubmitBtn, { backgroundColor: config.themeColor }]}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
  },
  loginBtn: {
    marginTop: 10,
  },
  footerSection: {
    marginTop: 24,
    alignItems: "center",
  },
  registerText: {
    color: "#64748B",
    fontSize: 15,
  },
  registerBold: {
    fontWeight: "700",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "bold",
  },
  modalScroll: {
    gap: 16,
    paddingBottom: 20,
  },
  modalSubmitBtn: {
    marginTop: 10,
  },
});
