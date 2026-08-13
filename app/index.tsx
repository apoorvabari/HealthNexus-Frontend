import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ViewShot from "react-native-view-shot";

const { width } = Dimensions.get("window");

export default function IndexScreen() {
  const router = useRouter();
  const viewShotRef = useRef<any>(null);

  return (
    <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }} style={{ flex: 1 }}>
      <LinearGradient
        colors={["#F8FAFC", "#E0F2FE", "#F0FDF4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Ambient Background Elements */}
        <View style={styles.topBlob} />
        <View style={styles.bottomBlob} />

        {/* Main Content Card */}
        <View style={styles.contentContainer}>
          {/* Logo Container with Glassmorphic Effect */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoGlow} />
            <View style={styles.logoCard}>
              <Image
                source={require("../src/assets/images/healthnexus-logo.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Brand Typography */}
          <View style={styles.textGroup}>
            <Text style={styles.brandTitle}>HealthNexus</Text>
            <View style={styles.dividerLine} />
            <Text style={styles.brandTagline}>Your Health. Our Priority.</Text>
          </View>
        </View>

        {/* Bottom Action Area */}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.buttonWrapper}
            onPress={() => router.push("/select-portal")}
          >
            <LinearGradient
              colors={["#059669", "#06B6D4", "#0284C7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Choose Portal</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.arrowIcon} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.metaInfo}>
            <Text style={styles.versionText}>HealthNexus v1.0</Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.versionText}>Next-Gen Healthcare Platform</Text>
          </View>
        </View>
      </LinearGradient>
    </ViewShot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 52,
    overflow: "hidden",
  },
  topBlob: {
    position: "absolute",
    top: -width * 0.25,
    right: -width * 0.15,
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.375,
    backgroundColor: "rgba(6, 182, 212, 0.35)",
  },
  bottomBlob: {
    position: "absolute",
    bottom: -width * 0.15,
    left: -width * 0.15,
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: width * 0.325,
    backgroundColor: "rgba(16, 185, 129, 0.3)",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 480,
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
    position: "relative",
  },
  logoGlow: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(6, 182, 212, 0.25)",
    transform: [{ scale: 1.15 }],
  },
  logoCard: {
    width: 140,
    height: 140,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 1)",
    overflow: "hidden",
  },
  logoImage: {
    width: 125,
    height: 125,
  },
  textGroup: {
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.8,
    marginBottom: 10,
  },
  dividerLine: {
    width: 48,
    height: 3.5,
    backgroundColor: "#10B981",
    borderRadius: 2,
    marginBottom: 14,
  },
  brandTagline: {
    fontSize: 16,
    color: "#475569",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  footerContainer: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    paddingBottom: 16,
  },
  buttonWrapper: {
    width: "100%",
    borderRadius: 18,
    shadowColor: "#06B6D4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 24,
  },
  gradientButton: {
    flexDirection: "row",
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  versionText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#94A3B8",
    marginHorizontal: 8,
  },
});
