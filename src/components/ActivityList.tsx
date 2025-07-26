import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from '../types';

interface ActivityListProps {
  title: string;
  activities: Activity[];
  onAddActivity: (text: string) => void;
  onRemoveActivity: (id: string) => void;
  isDarkMode: boolean;
  isReadOnly?: boolean;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  title,
  activities,
  onAddActivity,
  onRemoveActivity,
  isDarkMode,
  isReadOnly = false,
}) => {
  const [inputText, setInputText] = useState('');

  const handleAddActivity = () => {
    if (inputText.trim()) {
      onAddActivity(inputText.trim());
      setInputText('');
    }
  };

  const handleRemoveActivity = (id: string) => {
    Alert.alert(
      'Remove Activity',
      'Are you sure you want to remove this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemoveActivity(id) },
      ]
    );
  };

  const renderActivity = ({ item }: { item: Activity }) => (
    <View style={[styles.activityItem, isDarkMode && styles.activityItemDark]}>
      <Text style={[styles.activityText, isDarkMode && styles.activityTextDark]}>
        {item.text}
      </Text>
      {!isReadOnly && (
        <TouchableOpacity
          onPress={() => handleRemoveActivity(item.id)}
          style={styles.removeButton}
        >
          <Ionicons name="close-circle" size={20} color={isDarkMode ? '#ff6b6b' : '#e74c3c'} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>{title}</Text>
      
      {!isReadOnly && (
        <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
          <TextInput
            style={[styles.input, isDarkMode && styles.inputDark]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Add an activity..."
            placeholderTextColor={isDarkMode ? '#888' : '#666'}
            onSubmitEditing={handleAddActivity}
          />
          <TouchableOpacity
            onPress={handleAddActivity}
            style={[styles.addButton, isDarkMode && styles.addButtonDark]}
          >
            <Ionicons name="add" size={24} color={isDarkMode ? '#fff' : '#2c3e50'} />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  containerDark: {
    backgroundColor: '#2c3e50',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  titleDark: {
    color: '#ecf0f1',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  inputContainerDark: {},
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  inputDark: {
    backgroundColor: '#34495e',
    borderColor: '#555',
    color: '#ecf0f1',
  },
  addButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginLeft: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDark: {
    backgroundColor: '#3498db',
  },
  list: {
    maxHeight: 200,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  activityItemDark: {
    backgroundColor: '#34495e',
  },
  activityText: {
    flex: 1,
    color: '#2c3e50',
    fontSize: 16,
  },
  activityTextDark: {
    color: '#ecf0f1',
  },
  removeButton: {
    marginLeft: 8,
  },
});
