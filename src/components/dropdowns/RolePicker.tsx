import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  role: string;
  setRole: (role: string) => void;
  error?: string;
}

export default function RolePicker({ role, setRole, error }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const roles = [
    { label: "Patient", value: "PATIENT" },
    { label: "Doctor", value: "DOCTOR" },
    { label: "Admin", value: "ADMIN" }
  ];

  const selectedOption = roles.find((r) => r.value === role);

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsOpen(!isOpen)}
        style={[
          styles.container,
          error ? styles.errorContainer : null,
          isOpen ? styles.activeContainer : null
        ]}
      >
        <Text
          style={[
            styles.valueText,
            { color: role === "" ? "#C0C0C0" : "#333333" }
          ]}
        >
          {selectedOption ? selectedOption.label : "Select Role"}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up-outline" : "chevron-down-outline"}
          size={20}
          color={isOpen ? "#0D6EFD" : "#777"}
        />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdown}>
          {roles.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={styles.option}
              activeOpacity={0.5}
              onPress={() => {
                setRole(item.value);
                setIsOpen(false);
              }}
            >
              <Text style={styles.optionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 15,
    position: "relative",
    zIndex: 100,
  },

  container: {
    height: 55,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
  },

  activeContainer: {
    borderColor: "#0D6EFD",
  },

  errorContainer: {
    borderColor: "#FF3B30",
  },

  valueText: {
    fontSize: 16,
  },

  dropdown: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },

  option: {
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },

  optionText: {
    fontSize: 16,
    color: "#333333",
  },

  errorText: {
    color: "#FF3B30",
    fontSize: 13,
    marginTop: 5,
    marginLeft: 3,
  },
});
