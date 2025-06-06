import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { CustomModal } from './CustomModal';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  icon?: string;
  buttonText?: string;
  autoClose?: boolean;
  autoCloseTime?: number;
  onButtonPress?: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  title,
  message,
  icon = 'checkmark-circle-outline',
  buttonText = 'OK',
  autoClose = true,
  autoCloseTime = 3000,
  onButtonPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Auto close after specified time if autoClose is true
  useEffect(() => {
    if (visible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, autoCloseTime, onClose]);

  const handleButtonPress = () => {
    if (onButtonPress) {
      onButtonPress();
    }
    onClose();
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      contentContainerStyle={styles.modalContainer}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
          <Ionicons
            name={icon as any}
            size={48}
            color={colors.success}
          />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        
        {message && (
          <Text style={[styles.message, { color: colors.icon }]}>{message}</Text>
        )}
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.success }]}
          onPress={handleButtonPress}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    paddingVertical: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 