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
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import CustomInput from "../../src/components/inputs/CustomInput";
import PasswordInput from "../../src/components/inputs/PasswordInput";
import PrimaryButton from "../../src/components/buttons/PrimaryButton";
import { login, resetPassword } from "../../src/services/AccountService";

export default function ReceptionistLoginScreen() {
  const router = useRouter();

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

      if (response.role && response.role.toUpperCase() !== "RECEPTIONIST") {
        Toast.show({
          type: "error",
          text1: "Access Denied",
          text2: `This account has role (${response.role}). Please use the correct portal.`,
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Receptionist Login Successful",
        text2: response.message || "Welcome to Front Desk Deskboard!",
      });

      setTimeout(() => {
        router.replace("/receptionist/home");
      }, 1000);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to login to Receptionist Portal.";
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
    <SafeAreaView style={styles.safeArea}>
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
            <Text style={styles.backText}>← Choose Portal</Text>
          </TouchableOpacity>

          <View style={styles.headerSection}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeIcon}>📋</Text>
              <Text style={styles.badgeText}>RECEPTIONIST PORTAL</Text>
            </View>
            <Text style={styles.title}>Reception Sign In</Text>
            <Text style={styles.subtitle}>
              Manage front desk check-ins, registrations & doctor schedules
            </Text>
          </View>

          <View style={styles.formCard}>
            <CustomInput
              label="Receptionist Email"
              placeholder="Enter email"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors({ ...errors, email: "" }); }}
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.email}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors({ ...errors, password: "" }); }}
              error={errors.password}
            />

            <TouchableOpacity onPress={() => setShowResetModal(true)} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <PrimaryButton
              title="Sign In to Reception Desk"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />
          </View>

          <View style={styles.footerSection}>
            <TouchableOpacity onPress={() => router.push("/receptionist/register")}>
              <Text style={styles.registerText}>
                New Receptionist? <Text style={styles.registerBold}>Register Account</Text>
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
                onChangeText={(t) => { setResetEmail(t); setResetErrors({ ...resetErrors, email: "" }); }}
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
                onChangeText={(t) => { setNewPassword(t); setResetErrors({ ...resetErrors, newPassword: "" }); }}
                error={resetErrors.newPassword}
              />

              <PasswordInput
                label="Confirm New Password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setResetErrors({ ...resetErrors, confirmPassword: "" }); }}
                error={resetErrors.confirmPassword}
              />

              <PrimaryButton
                title="Reset Password"
                onPress={handleResetPassword}
                loading={resetLoading}
                style={styles.modalSubmitBtn}
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
    backgroundColor: "#EEF2FF",
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
    color: "#4F46E5",
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
    backgroundColor: "#E0E7FF",
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
    color: "#4F46E5",
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
    color: "#475569",
    textAlign: "center",
    marginTop: 6,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 20,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  loginBtn: {
    backgroundColor: "#4F46E5",
    marginTop: 10,
  },
  footerSection: {
    marginTop: 24,
    alignItems: "center",
  },
  registerText: {
    color: "#475569",
    fontSize: 15,
  },
  registerBold: {
    color: "#4F46E5",
    fontWeight: "700",
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 16,
  },
  forgotText: {
    color: "#4F46E5",
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
    backgroundColor: "#4F46E5",
    marginTop: 10,
  },
});
