import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayEntry } from '../types';

const STORAGE_KEY = 'EN_APP_DATA';
const AUTO_EXPORT_KEY = 'EN_AUTO_EXPORT_TRACKER';

export const StorageService = {
  async getAllEntries(): Promise<DayEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const entries = data ? JSON.parse(data) : [];
      
      // Handle backward compatibility for entries without isSubmitted field
      return entries.map((entry: any) => ({
        ...entry,
        isSubmitted: entry.isSubmitted !== undefined ? entry.isSubmitted : false
      }));
    } catch (error) {
      console.error('Error getting entries:', error);
      return [];
    }
  },

  async getEntryByDate(date: string): Promise<DayEntry | null> {
    try {
      const entries = await this.getAllEntries();
      const entry = entries.find(entry => entry.date === date) || null;
      
      // Handle backward compatibility for entries without isSubmitted field
      if (entry && entry.isSubmitted === undefined) {
        entry.isSubmitted = false;
      }
      
      return entry;
    } catch (error) {
      console.error('Error getting entry by date:', error);
      return null;
    }
  },

  async saveEntry(entry: DayEntry): Promise<void> {
    try {
      const entries = await this.getAllEntries();
      const existingIndex = entries.findIndex(e => e.date === entry.date);
      
      if (existingIndex >= 0) {
        entries[existingIndex] = { ...entry, updatedAt: new Date().toISOString() };
      } else {
        entries.push(entry);
      }
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving entry:', error);
      throw error;
    }
  },

  async getEntriesForMonth(year: number, month: number): Promise<DayEntry[]> {
    try {
      const entries = await this.getAllEntries();
      return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === year && entryDate.getMonth() === month;
      });
    } catch (error) {
      console.error('Error getting entries for month:', error);
      return [];
    }
  },

  async getCompletedDates(): Promise<string[]> {
    try {
      const entries = await this.getAllEntries();
      return entries
        .filter(entry => entry.feelGoodAboutDay !== undefined && entry.isSubmitted)
        .map(entry => entry.date);
    } catch (error) {
      console.error('Error getting completed dates:', error);
      return [];
    }
  },

  async getLastAutoExportMonth(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTO_EXPORT_KEY);
    } catch (error) {
      console.error('Error getting last auto export month:', error);
      return null;
    }
  },

  async setLastAutoExportMonth(yearMonth: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTO_EXPORT_KEY, yearMonth);
    } catch (error) {
      console.error('Error setting last auto export month:', error);
      throw error;
    }
  },

  async resetAutoExportTracker(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTO_EXPORT_KEY);
    } catch (error) {
      console.error('Error resetting auto export tracker:', error);
      throw error;
    }
  }
};
