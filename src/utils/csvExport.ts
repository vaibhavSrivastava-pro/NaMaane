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

  async checkAndPromptAutoExport(): Promise<void> {
    // This is the main method to call for auto-export functionality
    await this.autoExportPreviousMonth();
  },

  async autoExportPreviousMonth(): Promise<void> {
    try {
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Check if we've already done auto-export for this month
      const lastAutoExport = await StorageService.getLastAutoExportMonth();
      if (lastAutoExport === currentYearMonth) {
        console.log('Auto-export already completed for this month');
        return;
      }

      // Calculate previous month (handles year boundary correctly)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEntries = await StorageService.getEntriesForMonth(
        lastMonth.getFullYear(), 
        lastMonth.getMonth()
      );

      // Only consider submitted entries for auto-export
      const submittedEntries = lastMonthEntries.filter(entry => entry.isSubmitted);

      // Only prompt if there's submitted data to export
      if (submittedEntries.length === 0) {
        console.log('No submitted entries found for previous month, skipping auto-export');
        await StorageService.setLastAutoExportMonth(currentYearMonth);
        return;
      }

      // Show prompt to user
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const lastMonthName = monthNames[lastMonth.getMonth()];
      const lastMonthYear = lastMonth.getFullYear();
      
      Alert.alert(
        'Auto-Export Available',
        `Would you like to export your ${lastMonthName} ${lastMonthYear} data? You have ${submittedEntries.length} submitted entries from that month.`,
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: async () => {
              // Mark as prompted but don't export
              await StorageService.setLastAutoExportMonth(currentYearMonth);
            }
          },
          {
            text: 'Export',
            onPress: async () => {
              try {
                await this.exportMonthToCSV(lastMonth.getFullYear(), lastMonth.getMonth());
                await StorageService.setLastAutoExportMonth(currentYearMonth);
              } catch (error) {
                console.error('Error during auto-export:', error);
                // Still mark as attempted to avoid repeated prompts
                await StorageService.setLastAutoExportMonth(currentYearMonth);
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error in auto-export check:', error);
    }
  },

  async resetAutoExportTracker(): Promise<void> {
    // Helper method to reset the auto-export tracker (useful for testing)
    await StorageService.resetAutoExportTracker();
  }
};
