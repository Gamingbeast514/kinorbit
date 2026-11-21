import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OrbitProvider } from './src/context/OrbitContext';
import { HubScreen } from './src/screens/HubScreen';
import { RadarScreen } from './src/screens/RadarScreen';
import { ShieldScreen } from './src/screens/ShieldScreen';
import { ZonesScreen } from './src/screens/ZonesScreen';
import { Colors, Radii } from './src/theme/tokens';

const Tab = createBottomTabNavigator();

const KinOrbitNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.bgPrimary,
    card: Colors.bgSecondary,
    text: Colors.textPrimary,
    border: Colors.borderSubtle,
    primary: Colors.accentPrimary,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <OrbitProvider>
        <NavigationContainer theme={KinOrbitNavTheme}>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarShowLabel: true,
              tabBarActiveTintColor: Colors.accentPrimary,
              tabBarInactiveTintColor: Colors.textMuted,
              tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '700',
                marginBottom: 4,
              },
              tabBarStyle: styles.floatingTabBar,
              tabBarIcon: ({ color, focused }) => {
                let iconName: keyof typeof Ionicons.glyphMap = 'planet-outline';
                if (route.name === 'Radar') {
                  iconName = focused ? 'planet' : 'planet-outline';
                } else if (route.name === 'Zones') {
                  iconName = focused ? 'layers' : 'layers-outline';
                } else if (route.name === 'Shield') {
                  iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
                } else if (route.name === 'Hub') {
                  iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                }
                return (
                  <View style={focused ? styles.activeIconWrap : undefined}>
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
      </OrbitProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  floatingTabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    height: 64,
    borderRadius: Radii.lg,
    backgroundColor: Colors.bgGlass,
    borderTopWidth: 1,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingTop: 6,
    elevation: 12,
  },
  activeIconWrap: {
    backgroundColor: Colors.accentPrimaryDim,
    borderRadius: Radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
});
