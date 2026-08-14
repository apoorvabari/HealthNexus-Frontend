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
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import CustomInput from "../src/components/inputs/CustomInput";
import PasswordInput from "../src/components/inputs/PasswordInput";
import PrimaryButton from "../src/components/buttons/PrimaryButton";
import { login, resetPassword } from "../src/services/UserService";
import { saveSession } from "../src/storage/AuthStorage";

interface ThemeConfig {
  color: string;
  badgeBg: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeIcon: string;
  loginButtonTitle: string;
  signupText: string;
  signupRoute: string;
  borderColor: string;
  glowColor: string;
}

export default function UnifiedLoginScreen() {
  const router = useRouter();
  const { role: queryRole } = useLocalSearchParams<{ role?: string }>();

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

  const roleKey = (queryRole || "").toLowerCase().trim();

  let theme: ThemeConfig = {
    color: "#34D399",
    badgeBg: "rgba(16, 185, 129, 0.1)",
    badgeColor: "#34D399",
    title: "HealthNexus Sign In",
    subtitle: "Enter your credentials to access your workspace",
    badgeText: "HEALTHNEXUS PORTAL",
    badgeIcon: "🩺",
    loginButtonTitle: "Sign In",
    signupText: "Need an account? Register Here",
    signupRoute: "/select-portal",
    borderColor: "rgba(52, 211, 153, 0.5)",
    glowColor: "rgba(16, 185, 129, 0.1)",
  };

  if (roleKey === "patient") {
    theme = {
      color: "#34D399",
      badgeBg: "rgba(16, 185, 129, 0.1)",
      badgeColor: "#34D399",
      title: "Patient Sign In",
      subtitle: "Access your medical history, doctors & appointments",
      badgeText: "PATIENT PORTAL",
      badgeIcon: "🩺",
      loginButtonTitle: "Sign In to Patient Portal",
      signupText: "New Patient? Register Here",
      signupRoute: "/patient/register",
      borderColor: "rgba(52, 211, 153, 0.5)",
      glowColor: "rgba(16, 185, 129, 0.1)",
    };
  } else if (roleKey === "doctor") {
    theme = {
      color: "#38BDF8",
      badgeBg: "rgba(6, 182, 212, 0.1)",
      badgeColor: "#38BDF8",
      title: "Doctor Sign In",
      subtitle: "Manage daily schedules, view patient records & write prescriptions",
      badgeText: "DOCTOR CONSOLE",
      badgeIcon: "👨‍⚕️",
      loginButtonTitle: "Sign In to Doctor Console",
      signupText: "New Doctor? Register Here",
      signupRoute: "/doctor/register",
      borderColor: "rgba(56, 189, 248, 0.5)",
      glowColor: "rgba(6, 182, 212, 0.1)",
    };
  } else if (roleKey === "receptionist") {
    theme = {
      color: "#C4B5FD",
      badgeBg: "rgba(139, 92, 246, 0.1)",
      badgeColor: "#C4B5FD",
      title: "Receptionist Sign In",
      subtitle: "Manage front desk registration & schedule appointments",
      badgeText: "RECEPTION DESK",
      badgeIcon: "📋",
      loginButtonTitle: "Sign In to Reception Desk",
      signupText: "New Receptionist? Register Here",
      signupRoute: "/receptionist/register",
      borderColor: "rgba(167, 139, 250, 0.5)",
      glowColor: "rgba(139, 92, 246, 0.1)",
    };
  } else if (roleKey === "admin") {
    theme = {
      color: "#F59E0B",
      badgeBg: "rgba(245, 158, 11, 0.1)",
      badgeColor: "#F59E0B",
      title: "Admin Sign In",
      subtitle: "System configuration & infrastructure management",
      badgeText: "SYSTEM ADMIN",
      badgeIcon: "⚙️",
      loginButtonTitle: "Sign In to Admin Console",
      signupText: "New Admin? Register Here",
      signupRoute: "/admin/register",
      borderColor: "rgba(245, 158, 11, 0.5)",
      glowColor: "rgba(245, 158, 11, 0.1)",
    };
  }

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
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{4,20}$/.test(newPassword)) {
      newErrors.newPassword = "4-20 chars: uppercase, lowercase, number & symbol.";
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
      });

      Toast.show({
        type: "success",
        text1: "Password Reset Successful",
        text2: "Your password has been updated. Please sign in with your new password.",
      });

      setShowResetModal(false);
      setResetEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to reset password.";
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
    if (loading) return;

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

      const responseRole = (response.role || "").toUpperCase().replace("ROLE_", "");

      if (roleKey && responseRole !== roleKey.toUpperCase()) {
        Toast.show({
          type: "error",
          text1: "Invalid Portal",
          text2: `You are a ${responseRole}, please login through the ${responseRole.toLowerCase()} portal.`,
        });
        setLoading(false);
        return;
      }

      if (response.accessToken) {
        await saveSession(response.accessToken, {
          id: response.id?.toString(),
          userId: response.userId?.toString(),
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          role: responseRole,
          lastLogin: response.lastLogin,
        });
      }

      Toast.show({
        type: "success",
        text1: "Login Successful",
        text2: response.message || `Welcome to your workspace!`,
      });

      setTimeout(() => {
        if (responseRole === "PATIENT") {
          router.replace("/patient/home");
        } else if (responseRole === "DOCTOR") {
          router.replace("/doctor/home");
        } else if (responseRole === "RECEPTIONIST") {
          router.replace("/receptionist/home");
        } else if (responseRole === "ADMIN") {
          router.replace("/admin/home");
        } else {
          router.replace("/select-portal");
        }
      }, 1000);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to login. Please check your credentials.";
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
      <LinearGradient
        colors={["#F8FAFC", "#F1F5F9", "#E2E8F0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/select-portal")}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={16} color="#94A3B8" />
              <Text style={styles.backText}>Change Portal</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.badgeBg, borderColor: theme.borderColor },
                ]}
              >
                <Text style={[styles.badgeText, { color: theme.badgeColor }]}>
                  {theme.badgeIcon} {theme.badgeText}
                </Text>
              </View>
              <Text style={styles.title}>{theme.title}</Text>
              <Text style={styles.subtitle}>{theme.subtitle}</Text>
            </View>

            <View style={[styles.card, { borderColor: theme.borderColor }]}>
              <CustomInput
                label="Email Address *"
                placeholder="Enter your registered email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrors({ ...errors, email: "" });
                }}
                error={errors.email}
                darkTheme={true}
              />

              <PasswordInput
                label="Password *"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors({ ...errors, password: "" });
                }}
                error={errors.password}
                darkTheme={true}
              />

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => {
                  setResetEmail(email);
                  setShowResetModal(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.forgotPasswordText, { color: theme.color }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <PrimaryButton
                title={theme.loginButtonTitle}
                onPress={handleLogin}
                loading={loading}
                style={{ backgroundColor: theme.color, marginTop: 10 }}
              />
            </View>

            <TouchableOpacity
              style={styles.signupContainer}
              onPress={() => router.push(theme.signupRoute as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.signupText}>
                {theme.signupText.split("? ")[0]}?{" "}
                <Text style={[styles.signupBold, { color: theme.color }]}>
                  {theme.signupText.split("? ")[1] || "Register"}
                </Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Reset Your Password</Text>
              <TouchableOpacity
                onPress={() => setShowResetModal(false)}
                style={styles.modalCloseIconBtn}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Enter your account email and new password credentials below.
            </Text>

            <CustomInput
              label="Account Email *"
              placeholder="user@healthnexus.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={resetEmail}
              onChangeText={(text) => {
                setResetEmail(text);
                setResetErrors({ ...resetErrors, email: "" });
              }}
              error={resetErrors.email}
              darkTheme={true}
            />

            <PasswordInput
              label="New Password *"
              placeholder="4-20 chars with Uppercase, Number & Symbol"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                setResetErrors({ ...resetErrors, newPassword: "" });
              }}
              error={resetErrors.newPassword}
              darkTheme={true}
            />

            <PasswordInput
              label="Confirm New Password *"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setResetErrors({ ...resetErrors, confirmPassword: "" });
              }}
              error={resetErrors.confirmPassword}
              darkTheme={true}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowResetModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <PrimaryButton
                title="Reset Password"
                onPress={handleResetPassword}
                loading={resetLoading}
                style={[styles.modalSubmitButton, { backgroundColor: theme.color }]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },
  gradientContainer: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 24,
    justifyContent: "center",
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },
  backText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    marginTop: 6,
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 24,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 16,
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "700",
  },
  signupContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  signupText: {
    fontSize: 15,
    color: "#64748B",
  },
  signupBold: {
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 460,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalCloseIconBtn: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 20,
    lineHeight: 18,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  modalCancelButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  modalCancelText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },
  modalSubmitButton: {
    paddingHorizontal: 20,
    minWidth: 140,
  },
});
