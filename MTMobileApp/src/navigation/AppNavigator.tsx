import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';

import { useAuthStore } from '../store/auth';
import { locationTracker } from '../services/location-tracker';
import LoginScreen from '../screens/auth/LoginScreen';
import RouteScreen from '../screens/route/RouteScreen';
import VisitScreen from '../screens/visit/VisitScreen';
import CameraScreen from '../screens/photos/CameraScreen';
import NotesScreen from '../screens/visit/NotesScreen';
import StockScreen from '../screens/visit/StockScreen';
import TasksScreen from '../screens/tasks/TasksScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import NewCustomerScreen from '../screens/route/NewCustomerScreen';
import RouteCreateScreen from '../screens/route/RouteCreateScreen';
import VisitResultScreen from '../screens/visit/VisitResultScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Marşrut: '🗺️',
    Xəritə: '📍',
    Tapşırıqlar: '📋',
    Profil: '👤',
  };
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || '📱'}
    </Text>
  );
}

function MainTabs() {
  useEffect(() => {
    locationTracker.start();
    return () => {
      locationTracker.stop();
    };
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: 85,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Marşrut" component={RouteScreen} />
      <Tab.Screen name="Tapşırıqlar" component={TasksScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#F4F5F9',
        }}
      >
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Visit"
              component={VisitScreen}
              options={{
                headerShown: true,
                title: 'Ziyarət',
                headerTintColor: '#6C63FF',
                headerStyle: { backgroundColor: '#F4F5F9' },
              }}
            />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{
                headerShown: true,
                title: 'Foto çək',
                headerTintColor: '#fff',
                headerStyle: { backgroundColor: '#000' },
              }}
            />
            <Stack.Screen
              name="Notes"
              component={NotesScreen}
              options={{
                headerShown: true,
                title: 'Qeyd',
                headerTintColor: '#6C63FF',
                headerStyle: { backgroundColor: '#F4F5F9' },
              }}
            />
            <Stack.Screen
              name="Stock"
              component={StockScreen}
              options={{
                headerShown: true,
                title: 'Stok Yoxlama',
                headerTintColor: '#6C63FF',
                headerStyle: { backgroundColor: '#F4F5F9' },
              }}
            />
            <Stack.Screen
              name="NewCustomer"
              component={NewCustomerScreen}
              options={{ headerShown: true, title: 'Yeni müştəri sorğusu' }}
            />
            <Stack.Screen
              name="RouteCreate"
              component={RouteCreateScreen}
              options={{ headerShown: true, title: 'Yeni marşrut' }}
            />
            <Stack.Screen
              name="VisitResult"
              component={VisitResultScreen}
              options={{ headerShown: true, title: 'Ziyarət nəticəsi' }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
