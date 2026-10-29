import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

// Screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PlantsScreen from '../screens/PlantsScreen';
import PlantDetailScreen from '../screens/PlantDetailScreen';
import InspectionsScreen from '../screens/InspectionsScreen';
import AlertsScreen from '../screens/AlertsScreen';
import RobotScreen from '../screens/RobotScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
          borderBottomColor: colors.cardBorder,
          borderBottomWidth: 1
        },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>📊</Text>
        }}
      />
      <Tab.Screen
        name="Plants"
        component={PlantsScreen}
        options={{
          title: 'Plants',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🌱</Text>
        }}
      />
      <Tab.Screen
        name="Inspections"
        component={InspectionsScreen}
        options={{
          title: 'Scans',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🔍</Text>
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚠️</Text>
        }}
      />
      <Tab.Screen
        name="Robot"
        component={RobotScreen}
        options={{
          title: 'Rover',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🤖</Text>
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Config',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⚙️</Text>
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.emerald, fontSize: 16, fontWeight: '700' }}>
          FloraBot Mobile Initializing...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="PlantDetail"
              component={PlantDetailScreen}
              options={{
                headerShown: true,
                title: 'Plant Health Dossier',
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
