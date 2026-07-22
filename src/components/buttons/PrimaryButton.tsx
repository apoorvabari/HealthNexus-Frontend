import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

interface ButtonProps {
  title: string;

  onPress: () => void;

  loading?: boolean;
}

const PrimaryButton = ({ title, onPress, loading = false }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1565C0",

    padding: 15,

    borderRadius: 10,

    alignItems: "center",
  },

  text: {
    color: "#fff",

    fontSize: 18,

    fontWeight: "bold",
  },
});
