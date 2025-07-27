import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_DATE_KEY = 'EN_SELECTED_DATE';

export const DateSelectionService = {
  async setSelectedDate(date: string): Promise<void> {
    try {
      await AsyncStorage.setItem(SELECTED_DATE_KEY, date);
      console.log('DateSelectionService: Set selected date to', date);
    } catch (error) {
      console.error('Error setting selected date:', error);
    }
  },

  async getSelectedDate(): Promise<string | null> {
    try {
      const date = await AsyncStorage.getItem(SELECTED_DATE_KEY);
      console.log('DateSelectionService: Got selected date', date);
      return date;
    } catch (error) {
      console.error('Error getting selected date:', error);
      return null;
    }
  },

  async clearSelectedDate(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SELECTED_DATE_KEY);
      console.log('DateSelectionService: Cleared selected date');
    } catch (error) {
      console.error('Error clearing selected date:', error);
    }
  }
};
