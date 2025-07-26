// Test script for auto-export functionality
// This can be run in the Expo development console to test the auto-export logic

import { CSVExportService } from './src/utils/csvExport';
import { StorageService } from './src/utils/storage';

// Function to test auto-export functionality
const testAutoExport = async () => {
  console.log('Testing auto-export functionality...');
  
  try {
    // Check current auto-export status
    const lastExport = await StorageService.getLastAutoExportMonth();
    console.log('Last auto-export month:', lastExport);
    
    // Reset the tracker to force a test
    await CSVExportService.resetAutoExportTracker();
    console.log('Reset auto-export tracker');
    
    // Trigger auto-export check
    await CSVExportService.checkAndPromptAutoExport();
    console.log('Auto-export check completed');
    
  } catch (error) {
    console.error('Error testing auto-export:', error);
  }
};

// Function to check auto-export status
const checkAutoExportStatus = async () => {
  try {
    const lastExport = await StorageService.getLastAutoExportMonth();
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${now.getMonth().toString().padStart(2, '0')}`;
    
    console.log('Current month:', currentYearMonth);
    console.log('Last auto-export:', lastExport);
    console.log('Auto-export needed:', lastExport !== currentYearMonth);
    
  } catch (error) {
    console.error('Error checking auto-export status:', error);
  }
};

// Export functions for manual testing
export { testAutoExport, checkAutoExportStatus };
