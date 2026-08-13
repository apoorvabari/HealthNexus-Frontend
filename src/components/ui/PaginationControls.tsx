import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
}: PaginationControlsProps) {
  if (totalElements === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, currentPage === 0 && styles.buttonDisabled]}
        disabled={currentPage === 0}
        onPress={() => onPageChange(currentPage - 1)}
      >
        <Ionicons name="chevron-back" size={20} color={currentPage === 0 ? "#CBD5E1" : "#475569"} />
        <Text style={[styles.buttonText, currentPage === 0 && styles.buttonTextDisabled]}>Prev</Text>
      </TouchableOpacity>
      
      <Text style={styles.pageInfo}>
        Page {currentPage + 1} of {Math.max(1, totalPages)}
      </Text>

      <TouchableOpacity
        style={[styles.button, currentPage >= totalPages - 1 && styles.buttonDisabled]}
        disabled={currentPage >= totalPages - 1}
        onPress={() => onPageChange(currentPage + 1)}
      >
        <Text style={[styles.buttonText, currentPage >= totalPages - 1 && styles.buttonTextDisabled]}>Next</Text>
        <Ionicons name="chevron-forward" size={20} color={currentPage >= totalPages - 1 ? "#CBD5E1" : "#475569"} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginHorizontal: 4,
  },
  buttonTextDisabled: {
    color: '#CBD5E1',
  },
  pageInfo: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  }
});
