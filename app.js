import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { AdManager } from './src/services/AdManager';
import { AudioService } from './src/services/AudioService';
import { GameStateProvider } from './src/context/GameStateContext';

// Import Screens (Assuming standard routing structure)
import GameScreen from './src/screens/GameScreen';
import WinScreen from './src/screens/WinScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ShopScreen from './src/screens/ShopScreen';

// Prevent the splash screen from auto-hiding before the asynchronous resources are loaded
SplashScreen.preventAutoHideAsync().catch(() => {
  // Catch block prevents fatal crash if splash screen is already hidden by the native OS
});

const Stack = createStackNavigator();

export default function App() {
  const = useState(false);
  const [initializationError, setInitializationError] = useState(null);

  useEffect(() => {
    async function prepareApplicationCore() {
      try {
        // Pre-load typography to prevent layout shifts and rendering crashes
        await Font.loadAsync({
          // Fallback system fonts can be mapped here if custom assets are unavailable
          'system-regular': Font.isLoaded('system-regular')? null : require('./assets/fonts/Regular.ttf'),
          'system-bold': Font.isLoaded('system-bold')? null : require('./assets/fonts/Bold.ttf'),
        });
        
        // Initialize Ad Networks to prevent background crashes during GameScreen mounting
        await AdManager.initializeCoreNetwork();
        
        // Pre-load audio contexts into device memory
        await AudioService.initializeHardwareAudio();
        
        // Artificial synchronization delay for smooth UX transition (optional but recommended)
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (e) {
        console.warn("Critical Initialization Error Detected: ", e);
        setInitializationError(e);
      } finally {
        // Unconditionally command the application state to permit rendering
        setAppIsReady(true);
      }
    }

    prepareApplicationCore();
  },);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Safely dismiss the native splash screen only after the React tree is mounted
      await SplashScreen.hideAsync();
    }
  },);

  if (!appIsReady) {
    // This explicit fallback layer prevents the white screen of death
    // by rendering a native activity indicator during the resolution phase
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.rootView} onLayout={onLayoutRootView}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <GameStateProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Game" 
            screenOptions={{ 
              headerShown: false,
              cardStyle: { backgroundColor: '#ffffff' },
              animationEnabled: true,
            }}
          >
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="Win" component={WinScreen} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Shop" component={ShopScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </GameStateProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootView: { flex: 1, backgroundColor: '#ffffff' },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#ffffff' 
  }
});
