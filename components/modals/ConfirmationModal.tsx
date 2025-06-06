import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { CustomModal } from './CustomModal';

interface Action {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
  icon?: string;
}

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  icon?: string;
  iconColor?: string;
  actions: Action[];
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  title,
  message,
  icon = 'help-circle-outline',
  iconColor,
  actions,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getStyleForAction = (style?: 'default' | 'cancel' | 'destructive') => {
    switch (style) {
      case 'destructive':
        return { color: colors.notification };
      case 'cancel':
        return { color: colors.icon };
      default:
        return { color: colors.tint };
    }
  };

  const handleActionPress = (action: Action) => {
    if (action.style === 'destructive') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    action.onPress();
    onClose();
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      showCloseButton={false}
      contentContainerStyle={styles.modalContainer}
      closeOnOverlayPress={true}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon as any}
            size={48}
            color={iconColor || colors.tint}
          />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        
        {message && (
          <Text style={[styles.message, { color: colors.icon }]}>{message}</Text>
        )}
        
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.actionButton,
                action.style === 'destructive' && styles.destructiveButton,
                { borderColor: colors.border }
              ]}
              onPress={() => handleActionPress(action)}
            >
              {action.icon && (
                <Ionicons
                  name={action.icon as any}
                  size={20}
                  color={getStyleForAction(action.style).color}
                  style={styles.actionIcon}
                />
              )}
              <Text
                style={[
                  styles.actionText,
                  getStyleForAction(action.style),
                  action.style === 'destructive' && styles.destructiveText,
                ]}
              >
                {action.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  actionsContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  destructiveButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  destructiveText: {
    color: '#FF3B30',
  },
  actionIcon: {
    marginRight: 8,
  },
}); 