import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { WSScreen } from '../screens/WSScreen';
import { TabParamList, RootStackParamList } from '../types';
import { CSVExportService } from '../utils/csvExport';

const Drawer = createDrawerNavigator<TabParamList>();

type NavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

export const MainTabNavigator: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation<NavigationProp>();

  const handleExportCSV = async () => {
    try {
      const today = new Date();
      await CSVExportService.exportMonthToCSV(today.getFullYear(), today.getMonth());
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export CSV. Please try again.');
    }
  };

  return (
    <Drawer.Navigator
      initialRouteName="EN"
      screenOptions={({ navigation: drawerNavigation }) => ({
        headerStyle: {
          backgroundColor: isDarkMode ? '#2c3e50' : '#f8f9fa',
        },
        headerTintColor: isDarkMode ? '#ecf0f1' : '#2c3e50',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => drawerNavigation.openDrawer()}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name="menu"
              size={26}
              color={isDarkMode ? '#ecf0f1' : '#2c3e50'}
            />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={styles.headerButtonContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Calendar')}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar"
                size={25}
                color={isDarkMode ? '#ecf0f1' : '#2c3e50'}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleExportCSV}
              style={[styles.headerButton, styles.exportButton]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="download"
                size={27}
                color={isDarkMode ? '#ecf0f1' : '#2c3e50'}
              />
            </TouchableOpacity>
          </View>
        ),
        drawerStyle: {
          backgroundColor: isDarkMode ? '#2c3e50' : '#ffffff',
          width: 280,
        },
        drawerActiveTintColor: isDarkMode ? '#3498db' : '#2980b9',
        drawerInactiveTintColor: isDarkMode ? '#bdc3c7' : '#7f8c8d',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          marginLeft: -10,
        },
        drawerItemStyle: {
          marginVertical: 8,
          paddingVertical: 4,
        },
      })}
    >
      <Drawer.Screen
        name="EN"
        component={HomeScreen}
        options={{
          title: 'Na Maane! - Personal',
          drawerLabel: 'Personal Tracking',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="WS"
        component={WSScreen}
        options={{
          title: 'Na Maane! - Work & Study',
          drawerLabel: 'Work & Study',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  headerButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 4, // Increased from 2 to 4 to accommodate larger icons
    marginRight: 16, // More margin to push further right
  },
  headerButton: {
    marginHorizontal: 1, // Reduced from 4 to 1 for closer spacing
    padding: 8, // Reduced padding for tighter container
    borderRadius: 6,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButton: {
    marginTop: -2, // Move the export icon up by 2px
    minHeight: 42, // Slightly taller to accommodate larger icon
  },
});
