import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function StartLogoScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Background decorative circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.content}>
        <View style={styles.centerContainer}>
          {/* Logo Section */}
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.logoOuterRing}>
              <View style={styles.logoInnerRing}>
                <Image
                  source={require("../src/assets/images/healthnexus-logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
          </Animated.View>

          {/* Title Section */}
          <Animated.View style={[styles.titleSection, { opacity: fadeAnim }]}>
            <Text style={styles.appName}>HealthNexus</Text>
            <Text style={styles.tagline}>Your Health. Our Priority.</Text>
          </Animated.View>
        </View>

        {/* Bottom Button */}
        <Animated.View
          style={[
            styles.bottomContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: buttonAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/select-portal")}
            activeOpacity={0.88}
          >
            <Text style={styles.startButtonText}>Choose Portal</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>HealthNexus v1.0  •  Next-Gen Healthcare</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  bgCircle1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#EFF6FF",
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#F0FDF4",
    bottom: 80,
    left: -60,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: height * 0.04,
    paddingBottom: 36,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
  },
  logoWrapper: {
    alignItems: "center",
  },
  logoOuterRing: {
    width: width * 0.52,
    height: width * 0.52,
    maxWidth: 220,
    maxHeight: 220,
    borderRadius: 120,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0D6EFD",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#DBEAFE",
  },
  logoInnerRing: {
    width: "86%",
    height: "86%",
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0,
  },
  logo: {
    width: "90%",
    height: "90%",
  },
  titleSection: {
    alignItems: "center",
  },
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -1,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 8,
    fontWeight: "500",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
    gap: 14,
  },
  startButton: {
    backgroundColor: "#0D6EFD",
    width: "100%",
    paddingVertical: 18,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0D6EFD",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 7,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginRight: 10,
  },
  arrowIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  versionText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
  },
});
