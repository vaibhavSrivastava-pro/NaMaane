import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StorageService } from '../utils/storage';
import { DateSelectionService } from '../utils/dateSelection';
import { RootStackParamList } from '../types';

type CalendarScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Calendar'>;

export const CalendarScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation<CalendarScreenNavigationProp>();
  
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});

  useEffect(() => {
    loadCompletedDates();
  }, []);

  // Refresh calendar when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCompletedDates();
    }, [])
  );

  const loadCompletedDates = async () => {
    try {
      const completedDates = await StorageService.getCompletedDates();
      const marked: {[key: string]: any} = {};
      
      completedDates.forEach(date => {
        marked[date] = {
          selected: true,
          selectedColor: '#e67e22', // Dark orange color
          selectedTextColor: '#ffffff',
        };
      });
      
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading completed dates:', error);
    }
  };

  const onDayPress = async (day: DateData) => {
    try {
      // Store the selected date in global state
      await DateSelectionService.setSelectedDate(day.dateString);
      
      // Navigate back to Main tab navigator
      navigation.navigate('Main');
      
      console.log('Calendar: Selected date', day.dateString);
    } catch (error) {
      console.error('Error navigating to day entry:', error);
    }
  };

  const calendarTheme = {
    backgroundColor: isDarkMode ? '#2c3e50' : '#ffffff',
    calendarBackground: isDarkMode ? '#2c3e50' : '#ffffff',
    textSectionTitleColor: isDarkMode ? '#ecf0f1' : '#2c3e50',
    selectedDayBackgroundColor: '#e67e22',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#3498db',
    dayTextColor: isDarkMode ? '#ecf0f1' : '#2c3e50',
    textDisabledColor: isDarkMode ? '#555' : '#d9e1e8',
    dotColor: '#e67e22',
    selectedDotColor: '#ffffff',
    arrowColor: isDarkMode ? '#ecf0f1' : '#2c3e50',
    monthTextColor: isDarkMode ? '#ecf0f1' : '#2c3e50',
    indicatorColor: '#e67e22',
    textDayFontWeight: '300' as const,
    textMonthFontWeight: 'bold' as const,
    textDayHeaderFontWeight: '300' as const,
    textDayFontSize: 16,
    textMonthFontSize: 16,
    textDayHeaderFontSize: 13,
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>
          Tracking Calendar
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.subtitleDark]}>
          Days highlighted show submitted entries with completed tracking
        </Text>
      </View>
      
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={calendarTheme}
        style={[styles.calendar, isDarkMode && styles.calendarDark]}
        hideExtraDays={true}
        firstDay={1} // Monday as first day
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerDark: {
    backgroundColor: '#2c3e50',
    borderBottomColor: '#34495e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  titleDark: {
    color: '#ecf0f1',
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  subtitleDark: {
    color: '#bdc3c7',
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#ecf0f1',
    margin: 16,
    borderRadius: 12,
  },
  calendarDark: {
    borderColor: '#34495e',
  },
});
