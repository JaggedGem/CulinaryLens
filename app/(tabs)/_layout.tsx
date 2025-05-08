import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import CameraScreen from './camera';
import GroceriesScreen from './groceries';
import HomeScreen from './home';
import ProfileScreen from './profile';
import RecipesScreen from './recipes';

const Tab = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.tabBar,
      { 
        paddingBottom: insets.bottom || 10, 
        backgroundColor: colorScheme === 'dark' ? colors.card : 'white',
        borderTopColor: colorScheme === 'dark' ? colors.border : 'rgba(0, 0, 0, 0.1)',
      }
    ]}>
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
          const isFocused = state.index === index;

          let iconName: any;
          if (route.name === 'home') {
            iconName = isFocused ? 'home' : 'home-outline';
          } else if (route.name === 'recipes') {
            iconName = isFocused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'camera') {
            iconName = 'camera';
          } else if (route.name === 'groceries') {
            iconName = isFocused ? 'basket' : 'basket-outline';
          } else if (route.name === 'profile') {
            iconName = isFocused ? 'person' : 'person-outline';
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (route.name === 'camera') {
            return (
              <View key={index} style={styles.cameraButtonContainer}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={onPress}
                  style={styles.cameraButton}
                >
                  <View style={[
                    styles.cameraButtonInner, 
                    { 
                      backgroundColor: colors.tint,
                      borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 180, 0, 0.3)',
                    }
                  ]}>
                    <Ionicons name={iconName} size={28} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabItem}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? colors.tabIconSelected : colors.tabIconDefault}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="recipes"
        component={RecipesScreen}
        options={{
          title: 'Recipes',
        }}
      />
      <Tab.Screen
        name="camera"
        component={CameraScreen}
        options={{
          title: 'Camera',
        }}
      />
      <Tab.Screen
        name="groceries"
        component={GroceriesScreen}
        options={{
          title: 'Groceries',
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'column',
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    position: 'relative',
    paddingTop: 15, // Add space for the camera button to extend upward
  },
  tabBarContent: {
    flexDirection: 'row',
    height: 50,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    top: -30, // Position the button above the tab bar
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
  },
  cameraButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 0,
  },
});
