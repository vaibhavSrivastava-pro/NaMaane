import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './src/components/MainTabNavigator';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { RootStackParamList } from './src/types';
import { CSVExportService } from './src/utils/csvExport';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    // Check if it's the first day of the month to auto-export
    const today = new Date();
    if (today.getDate() === 1) {
      // Auto-export previous month
      CSVExportService.autoExportPreviousMonth().catch(console.error);
    }
  }, []);

  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: '#3498db',
      background: isDarkMode ? '#1a1a1a' : '#ffffff',
      card: isDarkMode ? '#2c3e50' : '#f8f9fa',
      text: isDarkMode ? '#ecf0f1' : '#2c3e50',
      border: isDarkMode ? '#34495e' : '#ecf0f1',
      notification: '#e67e22',
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400' as const,
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as const,
      },
      bold: {
        fontFamily: 'System',
        fontWeight: 'bold' as const,
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '700' as const,
      },
    },
  };

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#2c3e50' : '#f8f9fa'}
      />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
          />
          <Stack.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{
              headerShown: true,
              title: 'Calendar',
              headerStyle: {
                backgroundColor: isDarkMode ? '#2c3e50' : '#f8f9fa',
              },
              headerTintColor: isDarkMode ? '#ecf0f1' : '#2c3e50',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 20,
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  headerButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: -8, // Adjust for better alignment
  },
  headerButton: {
    marginLeft: 20,
    padding: 8,
    borderRadius: 8,
    minWidth: 44, // Minimum touch target size
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
