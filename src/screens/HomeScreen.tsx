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
import { ActivityList } from '../components/ActivityList';
import { MoodSection } from '../components/MoodSection';
import { DayEntry, Activity } from '../types';
import { StorageService } from '../utils/storage';
import { DateUtils } from '../utils/dateUtils';

// Simple ID generator
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const HomeScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  const [productiveActivities, setProductiveActivities] = useState<Activity[]>([]);
  const [unproductiveActivities, setUnproductiveActivities] = useState<Activity[]>([]);
  const [feelGood, setFeelGood] = useState<boolean | undefined>(undefined);
  const [feelGoodReason, setFeelGoodReason] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const today = DateUtils.getTodayString();

  useEffect(() => {
    loadTodayData();
  }, []);

  useEffect(() => {
    // Only auto-save if not submitted or if currently editing
    if (!isSubmitted || isEditing) {
      saveTodayData();
    }
  }, [productiveActivities, unproductiveActivities, feelGood, feelGoodReason]);

  const loadTodayData = async () => {
    try {
      const todayEntry = await StorageService.getEntryByDate(today);
      if (todayEntry) {
        setProductiveActivities(
          todayEntry.productiveActivities.map((text, index) => ({
            id: generateId(),
            text,
            createdAt: new Date().toISOString(),
          }))
        );
        setUnproductiveActivities(
          todayEntry.unproductiveActivities.map((text, index) => ({
            id: generateId(),
            text,
            createdAt: new Date().toISOString(),
          }))
        );
        setFeelGood(todayEntry.feelGoodAboutDay);
        setFeelGoodReason(todayEntry.feelGoodReason || '');
        setIsSubmitted(todayEntry.isSubmitted || false);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error loading today data:', error);
    }
  };

  const saveTodayData = async () => {
    try {
      const dayEntry: DayEntry = {
        id: generateId(),
        date: today,
        productiveActivities: productiveActivities.map(a => a.text),
        unproductiveActivities: unproductiveActivities.map(a => a.text),
        feelGoodAboutDay: feelGood,
        feelGoodReason: feelGoodReason,
        isSubmitted: isSubmitted,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await StorageService.saveEntry(dayEntry);
    } catch (error) {
      console.error('Error saving today data:', error);
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
      await saveTodayData();
      Alert.alert('Entry Submitted', 'Your daily entry has been successfully submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit entry. Please try again.');
      setIsSubmitted(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsSubmitted(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    loadTodayData(); // Reload original data
  };

  const hasActivities = productiveActivities.length > 0 || unproductiveActivities.length > 0;
  const isReadOnly = isSubmitted && !isEditing;

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isSubmitted && !isEditing && (
          <View style={[styles.statusContainer, isDarkMode && styles.statusContainerDark]}>
            <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
            <Text style={[styles.statusText, isDarkMode && styles.statusTextDark]}>
              Entry Submitted for {DateUtils.formatDisplayDate(today)}
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
          isDisabled={!hasActivities || isReadOnly}
          isDarkMode={isDarkMode}
        />

        {/* Submit/Edit Buttons */}
        <View style={styles.buttonContainer}>
          {!isSubmitted && (
            <TouchableOpacity
              style={[
                styles.submitButton,
                isDarkMode && styles.submitButtonDark,
                (!hasActivities || feelGood === undefined) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!hasActivities || feelGood === undefined}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Entry</Text>
            </TouchableOpacity>
          )}

          {isSubmitted && !isEditing && (
            <TouchableOpacity
              style={[styles.editButton, isDarkMode && styles.editButtonDark]}
              onPress={handleEdit}
            >
              <Ionicons name="create" size={20} color="#fff" />
              <Text style={styles.editButtonText}>Edit Entry</Text>
            </TouchableOpacity>
          )}

          {isEditing && (
            <View style={styles.editingButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, isDarkMode && styles.cancelButtonDark]}
                onPress={handleCancelEdit}
              >
                <Ionicons name="close" size={20} color="#fff" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isDarkMode && styles.saveButtonDark,
                  (!hasActivities || feelGood === undefined) && styles.saveButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!hasActivities || feelGood === undefined}
              >
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
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
  },
  statusContainerDark: {
    backgroundColor: '#2d5a41',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#27ae60',
    marginLeft: 8,
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
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDark: {
    backgroundColor: '#229954',
  },
  saveButtonDisabled: {
    backgroundColor: '#95a5a6',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
