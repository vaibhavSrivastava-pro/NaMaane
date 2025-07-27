import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  useColorScheme,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { ActivityList } from '../components/ActivityList';
import { MoodSection } from '../components/MoodSection';
import { DayEntry, Activity, TabParamList } from '../types';
import { StorageService } from '../utils/storage';
import { DateSelectionService } from '../utils/dateSelection';
import { DateUtils } from '../utils/dateUtils';

// Simple ID generator
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

type HomeScreenRouteProp = RouteProp<TabParamList, 'EN'>;

export const HomeScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const route = useRoute<HomeScreenRouteProp>();
  
  const [productiveActivities, setProductiveActivities] = useState<Activity[]>([]);
  const [unproductiveActivities, setUnproductiveActivities] = useState<Activity[]>([]);
  const [feelGood, setFeelGood] = useState<boolean | undefined>(undefined);
  const [feelGoodReason, setFeelGoodReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);  const [isEditing, setIsEditing] = useState(false);
  const [entryId, setEntryId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>(DateUtils.getTodayString());
  const [isDateSwitching, setIsDateSwitching] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Load initial data on component mount
  useEffect(() => {
    const initializeDate = async () => {
      setIsDateSwitching(true); // Prevent auto-save during initialization
      
      // Check if there's a selected date from calendar navigation
      const selectedDate = await DateSelectionService.getSelectedDate();
      const dateToLoad = selectedDate || route.params?.selectedDate || DateUtils.getTodayString();
      
      console.log('HomeScreen initializing with date:', dateToLoad);
      setCurrentDate(dateToLoad);
      await loadDataForDate(dateToLoad);
      
      // Clear the selected date after using it
      if (selectedDate) {
        await DateSelectionService.clearSelectedDate();
      }
      
      setIsDateSwitching(false);
      setIsInitialized(true);
    };
    
    initializeDate();
  }, []);

  // Handle route parameter changes and focus events
  useFocusEffect(
    React.useCallback(() => {
      const checkForDateChange = async () => {
        if (!isInitialized) return; // Don't process during initial load
        
        // Check if there's a new selected date from calendar
        const selectedDate = await DateSelectionService.getSelectedDate();
        
        if (selectedDate && selectedDate !== currentDate) {
          console.log('HomeScreen: Date changed from calendar to', selectedDate);
          
          // Save current data before switching
          setIsDateSwitching(true);
          await saveCurrentDataBeforeSwitch();
          
          setCurrentDate(selectedDate);
          await loadDataForDate(selectedDate);
          await DateSelectionService.clearSelectedDate();
          
          setIsDateSwitching(false);
        } else if (route.params?.selectedDate && route.params.selectedDate !== currentDate) {
          console.log('HomeScreen: Date changed from route params to', route.params.selectedDate);
          
          // Save current data before switching
          setIsDateSwitching(true);
          await saveCurrentDataBeforeSwitch();
          
          setCurrentDate(route.params.selectedDate);
          await loadDataForDate(route.params.selectedDate);
          
          setIsDateSwitching(false);
        }
      };
      
      checkForDateChange();
    }, [route.params?.selectedDate, currentDate, isInitialized])
  );

  const saveCurrentDataBeforeSwitch = async () => {
    try {
      // Only save if we have meaningful data (activities or mood)
      const hasData = productiveActivities.length > 0 || 
                     unproductiveActivities.length > 0 || 
                     feelGood !== undefined || 
                     feelGoodReason.trim() !== '';
      
      if (currentDate && hasData) {
        const dayEntry: DayEntry = {
          id: entryId || generateId(),
          date: currentDate,
          productiveActivities: productiveActivities.map(a => a.text),
          unproductiveActivities: unproductiveActivities.map(a => a.text),
          feelGoodAboutDay: feelGood,
          feelGoodReason: feelGoodReason,
          isSubmitted: isSubmitted,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await StorageService.saveEntry(dayEntry);
        console.log('Saved data for date before switching:', currentDate, 'with', 
                   productiveActivities.length + unproductiveActivities.length, 'activities');
      } else {
        console.log('No meaningful data to save for date:', currentDate);
      }
    } catch (error) {
      console.error('Error saving data before switch:', error);
    }
  };

  useEffect(() => {
    // Auto-save when data changes, but only if:
    // 1. Component is initialized
    // 2. Entry is not submitted yet (draft mode), OR currently editing an existing entry
    // 3. NOT currently switching dates (to prevent saving to wrong date)
    // 4. We have a valid current date
    if (isInitialized && (!isSubmitted || isEditing) && !isDateSwitching && currentDate) {
      const timeoutId = setTimeout(() => {
        console.log('Auto-saving for date:', currentDate);
        saveDataForDate();
      }, 500); // Debounce to avoid excessive saves
      
      return () => clearTimeout(timeoutId);
    }
  }, [productiveActivities, unproductiveActivities, feelGood, feelGoodReason, currentDate, isSubmitted, isEditing, isDateSwitching, isInitialized]);

  const loadDataForDate = async (date: string) => {
    try {
      console.log('Loading data for date:', date);
      
      // First, clear all current state to prevent any residual data
      setProductiveActivities([]);
      setUnproductiveActivities([]);
      setFeelGood(undefined);
      setFeelGoodReason('');
      setIsSubmitted(false);
      setIsEditing(false);
      setEntryId('');
      
      const entry = await StorageService.getEntryByDate(date);
      if (entry) {
        setEntryId(entry.id);
        setProductiveActivities(
          entry.productiveActivities.map((text, index) => ({
            id: generateId(),
            text,
            createdAt: new Date().toISOString(),
          }))
        );
        setUnproductiveActivities(
          entry.unproductiveActivities.map((text, index) => ({
            id: generateId(),
            text,
            createdAt: new Date().toISOString(),
          }))
        );
        setFeelGood(entry.feelGoodAboutDay);
        setFeelGoodReason(entry.feelGoodReason || '');
        setIsSubmitted(entry.isSubmitted || false);
        console.log('Loaded existing entry for', date, 'with', entry.productiveActivities.length + entry.unproductiveActivities.length, 'activities');
      } else {
        // New entry for this date
        setEntryId(generateId());
        console.log('Created new entry for', date);
      }
    } catch (error) {
      console.error('Error loading data for date:', error);
      // Ensure clean state even on error
      setEntryId(generateId());
      setProductiveActivities([]);
      setUnproductiveActivities([]);
      setFeelGood(undefined);
      setFeelGoodReason('');
      setIsSubmitted(false);
      setIsEditing(false);
    }
  };

  const saveDataForDate = async () => {
    try {
      const dayEntry: DayEntry = {
        id: entryId || generateId(),
        date: currentDate,
        productiveActivities: productiveActivities.map(a => a.text),
        unproductiveActivities: unproductiveActivities.map(a => a.text),
        feelGoodAboutDay: feelGood,
        feelGoodReason: feelGoodReason,
        isSubmitted: isSubmitted,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await StorageService.saveEntry(dayEntry);
      console.log('Auto-saved entry for', currentDate, 'with', 
                 dayEntry.productiveActivities.length + dayEntry.unproductiveActivities.length, 'activities');
    } catch (error) {
      console.error('Error saving data for date:', error);
    }
  };

  const addProductiveActivity = (text: string) => {
    const newActivity: Activity = {
      id: generateId(),
      text,
      createdAt: new Date().toISOString(),
    };
    setProductiveActivities(prev => [...prev, newActivity]);
  };

  const addUnproductiveActivity = (text: string) => {
    const newActivity: Activity = {
      id: generateId(),
      text,
      createdAt: new Date().toISOString(),
    };
    setUnproductiveActivities(prev => [...prev, newActivity]);
  };

  const removeProductiveActivity = (id: string) => {
    setProductiveActivities(prev => prev.filter(a => a.id !== id));
  };

  const removeUnproductiveActivity = (id: string) => {
    setUnproductiveActivities(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = async () => {
    if (!hasActivities) {
      Alert.alert('No Activities', 'Please add at least one activity before submitting.');
      return;
    }

    if (feelGood === undefined) {
      Alert.alert('Incomplete Entry', 'Please fill out how you feel about your day before submitting.');
      return;
    }

    try {
      setIsSubmitted(true);
      setIsEditing(false);
      await saveDataForDate();
      Alert.alert('Entry Submitted', 'Your daily entry has been successfully submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit entry. Please try again.');
      setIsSubmitted(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Auto-save is already enabled when editing, so changes save automatically
  };

  const handleFinishEdit = async () => {
    if (!hasActivities) {
      Alert.alert('No Activities', 'Please add at least one activity before finishing.');
      return;
    }

    if (feelGood === undefined) {
      Alert.alert('Incomplete Entry', 'Please fill out how you feel about your day before finishing.');
      return;
    }

    try {
      setIsSubmitted(true);
      setIsEditing(false);
      await saveDataForDate();
      Alert.alert('Changes Saved', 'Your entry has been updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setIsSubmitted(true);
    loadDataForDate(currentDate); // Reload original data
  };

  const hasActivities = productiveActivities.length > 0 || unproductiveActivities.length > 0;
  const isReadOnly = isSubmitted && !isEditing;
  const isToday = currentDate === DateUtils.getTodayString();
  const isPastDate = new Date(currentDate) < new Date(DateUtils.getTodayString());
  const canEdit = isToday || isPastDate; // Can edit today anytime, or any past date
  const canSubmit = !isSubmitted && canEdit; // Can submit if not already submitted and can edit

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Header */}
        {!isToday && (
          <View style={[styles.dateContainer, isDarkMode && styles.dateContainerDark]}>
            <Ionicons name="calendar" size={20} color={isDarkMode ? '#3498db' : '#2980b9'} />
            <Text style={[styles.dateText, isDarkMode && styles.dateTextDark]}>
              Viewing: {DateUtils.formatDisplayDate(currentDate)}
            </Text>
          </View>
        )}

        {isSubmitted && !isEditing && (
          <View style={[styles.statusContainer, isDarkMode && styles.statusContainerDark]}>
            <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
            <Text style={[styles.statusText, isDarkMode && styles.statusTextDark]}>
              Entry Submitted for {DateUtils.formatDisplayDate(currentDate)}
            </Text>
          </View>
        )}

        {isEditing && (
          <View style={[styles.editingContainer, isDarkMode && styles.editingContainerDark]}>
            <Ionicons name="create" size={20} color="#f39c12" />
            <Text style={[styles.editingText, isDarkMode && styles.editingTextDark]}>
              Editing Mode
            </Text>
          </View>
        )}

        <ActivityList
          title="What did I do Productive"
          activities={productiveActivities}
          onAddActivity={addProductiveActivity}
          onRemoveActivity={removeProductiveActivity}
          isDarkMode={isDarkMode}
          isReadOnly={isReadOnly}
        />

        <ActivityList
          title="What did I do Unproductive"
          activities={unproductiveActivities}
          onAddActivity={addUnproductiveActivity}
          onRemoveActivity={removeUnproductiveActivity}
          isDarkMode={isDarkMode}
          isReadOnly={isReadOnly}
        />

        <MoodSection
          feelGood={feelGood}
          reason={feelGoodReason}
          onFeelGoodChange={setFeelGood}
          onReasonChange={setFeelGoodReason}
          isDisabled={(!hasActivities && !isSubmitted) || isReadOnly}
          isDarkMode={isDarkMode}
          showActivityMessage={!isSubmitted}
        />

        {/* Submit/Edit Buttons */}
        <View style={styles.buttonContainer}>
          {canSubmit && (
            <TouchableOpacity
              style={[
                styles.submitButton,
                isDarkMode && styles.submitButtonDark,
                (!hasActivities || feelGood === undefined) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!hasActivities || feelGood === undefined}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Entry</Text>
            </TouchableOpacity>
          )}

          {isSubmitted && !isEditing && canEdit && (
            <TouchableOpacity
              style={[styles.editButton, isDarkMode && styles.editButtonDark]}
              onPress={handleEdit}
            >
              <Ionicons name="create-outline" size={22} color="#fff" />
              <Text style={styles.editButtonText}>Edit Entry</Text>
            </TouchableOpacity>
          )}

          {isEditing && (
            <View style={styles.editingButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, isDarkMode && styles.cancelButtonDark]}
                onPress={handleCancelEdit}
              >
                <Ionicons name="close-circle" size={22} color="#fff" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.finishButton,
                  isDarkMode && styles.finishButtonDark,
                  (!hasActivities || feelGood === undefined) && styles.finishButtonDisabled
                ]}
                onPress={handleFinishEdit}
                disabled={!hasActivities || feelGood === undefined}
              >
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.finishButtonText}>Finish</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d5f4e6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  statusContainerDark: {
    backgroundColor: '#2d5a41',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#27ae60',
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  statusTextDark: {
    color: '#58d68d',
  },
  editingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9e7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  editingContainerDark: {
    backgroundColor: '#5d4e37',
  },
  editingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f39c12',
    marginLeft: 8,
  },
  editingTextDark: {
    color: '#f7dc6f',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#27ae60',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDark: {
    backgroundColor: '#229954',
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editButtonDark: {
    backgroundColor: '#2980b9',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  editingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cancelButtonDark: {
    backgroundColor: '#c0392b',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  finishButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  finishButtonDark: {
    backgroundColor: '#229954',
  },
  finishButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.6,
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateContainerDark: {
    backgroundColor: '#34495e',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2980b9',
    marginLeft: 8,
  },
  dateTextDark: {
    color: '#5dade2',
  },
});
