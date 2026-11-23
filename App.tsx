import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OrbitProvider, useOrbit } from './src/context/OrbitContext';
import { HubScreen } from './src/screens/HubScreen';
import { RadarScreen } from './src/screens/RadarScreen';
import { ShieldScreen } from './src/screens/ShieldScreen';
import { ZonesScreen } from './src/screens/ZonesScreen';
import { Radii } from './src/theme/tokens';

const Tab = createBottomTabNavigator();

function KinOrbitTabs() {
  const { colors, profile } = useOrbit();
  const isLight = profile.themeMode === 'light';

  const navTheme = isLight
    ? {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.bgPrimary,
          card: colors.bgSecondary,
          text: colors.textPrimary,
          border: colors.borderSubtle,
          primary: colors.accentPrimary,
        },
      }
    : {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.bgPrimary,
          card: colors.bgSecondary,
          text: colors.textPrimary,
          border: colors.borderSubtle,
          primary: colors.accentPrimary,
        },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isLight ? 'dark' : 'light'} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: [
            styles.floatingTabBar,
            {
              backgroundColor: colors.bgSecondary,
              borderColor: colors.borderSubtle,
            },
          ],
          tabBarIcon: ({ color, focused }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'location-outline';
            if (route.name === 'Radar') {
              iconName = focused ? 'location' : 'location-outline';
            } else if (route.name === 'Zones') {
              iconName = focused ? 'layers' : 'layers-outline';
            } else if (route.name === 'Shield') {
              iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
            } else if (route.name === 'Hub') {
              iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
            }
            return (
              <View
                style={[
                  styles.iconPill,
                  focused && { backgroundColor: colors.accentPrimary },
                ]}
              >
                <Ionicons name={iconName} size={20} color={color} />
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Radar" component={RadarScreen} />
        <Tab.Screen name="Zones" component={ZonesScreen} />
        <Tab.Screen name="Shield" component={ShieldScreen} />
        <Tab.Screen name="Hub" component={HubScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <OrbitProvider>
        <KinOrbitTabs />
      </OrbitProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  floatingTabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 14,
    height: 62,
    borderRadius: Radii.lg,
    borderTopWidth: 1,
    borderWidth: 1,
    paddingTop: 6,
    elevation: 14,
  },
  iconPill: {
    width: 44,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
