<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# EN - React Native Productivity App

This is a React Native productivity app built with Expo and TypeScript. The app helps users track their daily activities and mood.

## Project Structure

- **src/screens**: Contains the main screens (HomeScreen, CalendarScreen)
- **src/components**: Reusable UI components (ActivityList, MoodSection)
- **src/utils**: Utility functions for storage, CSV export, and date handling
- **src/types**: TypeScript type definitions

## Key Features

1. **Activity Tracking**: Users can add productive and unproductive activities
2. **Mood Tracking**: Daily mood tracking with reasons (only enabled when activities are added)
3. **Calendar View**: Visual representation of completed days
4. **CSV Export**: Export monthly data to CSV format
5. **Dark Mode**: Automatic dark mode support based on system preference

## Technologies Used

- React Native with Expo
- TypeScript
- React Navigation
- AsyncStorage for data persistence
- React Native Calendars
- React Native File System for CSV export

## Development Guidelines

- Use functional components with hooks
- Follow TypeScript best practices
- Maintain dark mode compatibility
- Use consistent styling patterns
- Handle errors gracefully
- Implement proper data persistence
