import { Platform, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { DayEntry } from '../types';
import { StorageService } from './storage';

export const CSVExportService = {
  formatCSVData(entries: DayEntry[]): string {
    const headers = ['Date', 'What did I do Productive', 'What did I do Unproductive', 'Do you feel good about your day?', 'Why'];
    
    const rows = entries.map(entry => [
      entry.date,
      entry.productiveActivities.join('; '),
      entry.unproductiveActivities.join('; '),
      entry.feelGoodAboutDay !== undefined ? (entry.feelGoodAboutDay ? 'Yes' : 'No') : '',
      entry.feelGoodReason || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  },

  async exportMonthToCSV(year: number, month: number): Promise<void> {
    try {
      const entries = await StorageService.getEntriesForMonth(year, month);
      
      if (entries.length === 0) {
        Alert.alert('No Data', 'No entries found for this month.');
        return;
      }
      
      const csvData = this.formatCSVData(entries);
      
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const fileName = `EN-${monthNames[month]}${year}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      // Write the CSV file
      await FileSystem.writeAsStringAsync(fileUri, csvData, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export EN Data',
          UTI: 'public.comma-separated-values-text'
        });
      } else {
        Alert.alert(
          'Export Complete', 
          `CSV file saved as ${fileName}. File location: ${fileUri}`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert(
        'Export Error', 
        'Failed to export CSV file. Please try again.',
        [{ text: 'OK' }]
      );
      throw error;
    }
  },

  async autoExportPreviousMonth(): Promise<void> {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      await this.exportMonthToCSV(lastMonth.getFullYear(), lastMonth.getMonth());
    } catch (error) {
      console.error('Error auto-exporting:', error);
    }
  }
};
