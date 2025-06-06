import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ViewStyle
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeIconName?: string;
  animationType?: 'fade' | 'slide' | 'none';
  contentContainerStyle?: ViewStyle;
  overlayStyle?: ViewStyle;
  closeOnOverlayPress?: boolean;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  children,
  showCloseButton = true,
  closeIconName = 'close',
  animationType = 'fade',
  contentContainerStyle,
  overlayStyle,
  closeOnOverlayPress = true,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(100)).current;
  const [modalVisible, setModalVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleOverlayPress = () => {
    if (closeOnOverlayPress) {
      onClose();
    }
  };

  const handleClosePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <Animated.View 
          style={[
            styles.overlay, 
            { opacity: fadeAnim, backgroundColor: 'rgba(0,0,0,0.5)' },
            overlayStyle
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.contentContainer,
                { 
                  backgroundColor: colors.card,
                  transform: [{ translateY: slideAnim }],
                  marginBottom: insets.bottom,
                },
                contentContainerStyle,
              ]}
            >
              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClosePress}
                >
                  <Ionicons name={closeIconName as any} size={24} color={colors.icon} />
                </TouchableOpacity>
              )}
              {children}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 8,
  },
}); 