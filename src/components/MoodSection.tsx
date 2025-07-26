import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface MoodSectionProps {
  feelGood?: boolean;
  reason: string;
  onFeelGoodChange: (value: boolean | undefined) => void;
  onReasonChange: (text: string) => void;
  isDisabled: boolean;
  isDarkMode: boolean;
  showActivityMessage?: boolean;
}

export const MoodSection: React.FC<MoodSectionProps> = ({
  feelGood,
  reason,
  onFeelGoodChange,
  onReasonChange,
  isDisabled,
  isDarkMode,
  showActivityMessage = true,
}) => {
  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>
        Do you feel good about your day?
      </Text>
      
      <View style={[styles.pickerContainer, isDarkMode && styles.pickerContainerDark]}>
        <Picker
          selectedValue={feelGood}
          onValueChange={onFeelGoodChange}
          enabled={!isDisabled}
          style={[styles.picker, isDarkMode && styles.pickerDark]}
          dropdownIconColor={isDarkMode ? '#ecf0f1' : '#2c3e50'}
        >
          <Picker.Item label="Select..." value={undefined} />
          <Picker.Item label="Yes" value={true} />
          <Picker.Item label="No" value={false} />
        </Picker>
      </View>

      <TextInput
        style={[
          styles.reasonInput,
          isDarkMode && styles.reasonInputDark,
          isDisabled && styles.disabled,
        ]}
        value={reason}
        onChangeText={onReasonChange}
        placeholder="Why do you feel this way?"
        placeholderTextColor={isDarkMode ? '#888' : '#666'}
        multiline
        editable={!isDisabled}
        numberOfLines={3}
      />
      
      {isDisabled && showActivityMessage && (
        <Text style={[styles.disabledText, isDarkMode && styles.disabledTextDark]}>
          Add at least one activity above to fill this section
        </Text>
      )}
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
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  pickerContainerDark: {
    backgroundColor: '#34495e',
    borderColor: '#555',
  },
  picker: {
    color: '#2c3e50',
  },
  pickerDark: {
    color: '#ecf0f1',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    color: '#2c3e50',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  reasonInputDark: {
    backgroundColor: '#34495e',
    borderColor: '#555',
    color: '#ecf0f1',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  disabledTextDark: {
    color: '#ff6b6b',
  },
});
