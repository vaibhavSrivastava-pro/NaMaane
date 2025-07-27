# Na Maane! - React Native Productivity App

A React Native productivity app built with Expo and TypeScript. The app helps users track their daily activities and manage work/study tasks with a comprehensive todo system.

## Features

### EN Tab - Personal Daily Tracking
- 📝 **Activity Tracking**: Add and manage productive and unproductive activities
- 😊 **Mood Tracking**: Daily mood reflection with reasons (only enabled when activities are added)
- ✅ **Submit/Edit System**: Submit daily entries to finalize them, with ability to edit later
- 📅 **Calendar View**: Visual tracking of submitted entries highlighted in orange
- 📊 **CSV Export**: Export monthly data to CSV format with sharing capabilities
- 🔄 **Auto Export**: Automatically prompts to export previous month's data when entering a new month
- 📱 **Smart Prompting**: Auto-export only triggers once per month and only when data exists

### WS Tab - Work & Study Tasks
- ✅ **Multi-level Tasks**: Create tasks with unlimited subtasks hierarchy
- 🎯 **Task Completion**: Check off tasks and subtasks when completed
- 🔗 **Smart Completion**: Completing a parent task marks all subtasks as complete
- � **Intuitive Interface**: Expandable/collapsible task hierarchy
- 🗑️ **Task Management**: Add, delete, and organize tasks with ease

### General Features
- 🍔 **Hamburger Menu**: Easy navigation between EN and WS tabs
- 🌙 **Dark Mode**: Automatic theme switching based on system preference
- 💾 **Data Persistence**: All data stored locally using AsyncStorage

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation
- **AsyncStorage** for data persistence
- **React Native Calendars** for calendar view
- **Expo File System** and **Expo Sharing** for CSV export

## Installation

1. **Prerequisites**: Make sure you have Node.js installed on your Mac.

2. **Install Expo CLI globally** (if you haven't already):
   ```bash
   npm install -g expo-cli
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the App

### For Development

1. **Start the development server**:
   ```bash
   npm start
   ```

2. **Run on iOS Simulator**:
   ```bash
   npm run ios
   ```

3. **Run on Physical iPhone**:
   - Install the **Expo Go** app from the App Store
   - Scan the QR code displayed in the terminal/browser
   - **Note**: The app now works perfectly in Expo Go without requiring a development build

### For Production (iOS Device)

To run the app successfully on your iPhone in production, you'll need:

#### 1. iOS Setup Requirements

- **Xcode** (latest version from Mac App Store)
- **iOS development certificate** (Apple Developer Account required)
- **Device provisioning profile**

#### 2. Build for iOS

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure the build
eas build:configure

# Build for iOS
eas build --platform ios
```

### 3. Exporting IPA for Physical Device Installation

> **Prerequisites**: Make sure you have Xcode installed and an Apple Developer Account with a valid development certificate.

#### Step 1: Initial Setup
Before building the IPA, ensure your development environment is properly configured:

```bash
# Verify you have a valid development certificate
security find-identity -v -p codesigning

# Should show something like:
# 1) [TEAM_ID] "Apple Development: your.email@example.com (IDENTIFIER)"
```

#### Step 2: Configure Code Signing (One-time setup)
If you need to set up code signing, run the setup script:

```bash
./setup-code-signing.sh
```

This script will:
- Detect your development team ID
- Configure the project with proper signing settings
- Update the bundle identifier for your Apple Developer account

#### Step 3: Generate iOS Project
```bash
# Generate the native iOS project with Expo dev client
npx expo prebuild --platform ios
```

This creates the `ios/` directory with all necessary Xcode project files.

#### Step 4: Install iOS Dependencies
```bash
# Navigate to iOS directory and install CocoaPods dependencies
cd ios && pod install && cd ..
```

#### Step 5: Build and Export IPA
Use the automated build script that handles all the complex build steps:

```bash
# Run the IPA creation script
./create-ipa.sh
```

#### What the IPA Script Does:

1. **Installs expo-dev-client** (if not already present)
2. **Validates iOS project** structure
3. **Starts Metro bundler** in background for React Native code
4. **Builds and archives** the app for iOS device:
   - First attempts Release configuration
   - Falls back to Debug configuration if Release fails
   - Uses automatic code signing with `-allowProvisioningUpdates`
5. **Creates export options** for development distribution
6. **Exports the IPA** file to `build/NaMaane.ipa`
7. **Cleans up** by stopping Metro bundler

#### Step 6: Install IPA on Your iPhone

Once the IPA is created, you can install it using several methods:

**Method 1: Using Sideloadly (Recommended)**
1. Download [Sideloadly](https://sideloadly.io/)
2. Connect your iPhone to your Mac via USB
3. Open Sideloadly and drag the `build/NaMaane.ipa` file
4. Enter your Apple ID credentials
5. Install the app to your device

**Method 2: Using Xcode**
1. Open Xcode
2. Go to Window → Devices and Simulators
3. Select your connected iPhone
4. Drag the IPA file to the "Installed Apps" section

**Method 3: Using ios-deploy (Command Line)**
```bash
# Install ios-deploy if not already installed
npm install -g ios-deploy

# Install the IPA directly
ios-deploy --bundle build/NaMaane.ipa
```

#### Troubleshooting IPA Build Issues

**Code Signing Errors:**
- Ensure you have a valid Apple Developer certificate
- Run `./setup-code-signing.sh` to configure automatically
- Check that your bundle identifier is unique in your Apple Developer account

**Build Failures:**
- Clean your build folder: `rm -rf build/`
- Regenerate iOS project: `rm -rf ios && npx expo prebuild --platform ios`
- Update CocoaPods: `cd ios && pod install --repo-update && cd ..`

**Provisioning Profile Issues:**
- The script uses `-allowProvisioningUpdates` to handle this automatically
- Ensure your device is registered in your Apple Developer account
- Check that your development certificate hasn't expired

#### Alternative: Simulator Build (No Code Signing Required)
For testing without device installation requirements:

```bash
# Build and run on iOS Simulator
./build-simulator.sh
```

This builds the app for the iOS Simulator and doesn't require any code signing setup.

### 4. Expo Development Build

For easier testing on your iPhone:

1. Build a development version:
   ```bash
   eas build --profile development --platform ios
   ```

2. Install the generated `.ipa` file on your device via TestFlight or direct installation

#### 5. Required iOS Permissions

The app requires the following permissions that are automatically handled by Expo:
- File system access (for CSV export)
- Local storage access (for data persistence)

## App Structure

```
src/
├── components/              # Reusable UI components
│   ├── ActivityList.tsx     # Activity management component
│   ├── MoodSection.tsx      # Mood tracking component
│   └── MainTabNavigator.tsx # Drawer navigation with hamburger menu
├── screens/                 # App screens
│   ├── HomeScreen.tsx       # EN tab - Daily tracking screen
│   ├── WSScreen.tsx         # WS tab - Work & Study tasks
│   └── CalendarScreen.tsx   # Calendar view for submitted entries
├── utils/                   # Utility functions
│   ├── storage.ts           # AsyncStorage for EN entries
│   ├── taskStorage.ts       # AsyncStorage for WS tasks
│   ├── csvExport.ts         # CSV export functionality
│   └── dateUtils.ts         # Date formatting utilities
└── types/                   # TypeScript definitions
    └── index.ts             # App type definitions (DayEntry, Task, etc.)
```

## Usage

### EN Tab - Personal Tracking
1. **Add Activities**: Use the "+" button to add productive and unproductive activities
2. **Track Mood**: Once activities are added, you can select whether you feel good about your day and explain why
3. **Submit Entry**: Click "Submit Entry" to finalize your daily entry (entries are automatically saved as you type)
4. **Edit Entry**: After submitting, click "Edit Entry" to make changes, then "Save Changes" to finalize
5. **View Progress**: Tap the calendar icon to see your submitted entries (only submitted entries appear on calendar)
6. **Export Data**: Tap the download icon to export the current month's data as CSV

### WS Tab - Work & Study Tasks
1. **Add Main Tasks**: Type in the input field and press enter or tap the "+" button
2. **Add Subtasks**: Tap the "+" icon next to any task to add a subtask
3. **Complete Tasks**: Tap the checkbox to mark tasks as complete
4. **Expand/Collapse**: Tap the arrow icon to show/hide subtasks
5. **Delete Tasks**: Tap the trash icon to delete a task and all its subtasks
6. **Multi-level Hierarchy**: Create unlimited levels of subtasks for complex project organization

### Navigation
- **Hamburger Menu**: Tap the menu icon (☰) to switch between EN and WS tabs
- **Header Actions**: Calendar and export buttons work from both tabs

## Data Export (EN Tab)

- **Manual Export**: Use the download button in the navigation bar to export EN tracking data
- **Auto Export**: The app automatically prompts you to export the previous month's data when you enter a new month
- **Smart Timing**: Auto-export only triggers once per month and only when data exists for the previous month
- **User Choice**: You can choose to export immediately or skip the auto-export prompt
- **CSV Format**: Includes Date, Productive Activities, Unproductive Activities, Mood, and Reason
- **Note**: WS tasks are stored locally and persist across sessions but are not included in CSV exports

### Auto-Export Details

The auto-export feature works as follows:
1. **Trigger**: Checks for export opportunity every time the app starts
2. **Timing**: Only prompts once per month when entering a new month
3. **Data Check**: Only shows prompt if previous month has data to export
4. **User Control**: User can choose to export or skip
5. **Persistence**: Remembers choice to avoid repeated prompts

## Development Commands

- `npm start` - Start the development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android (if Android dependencies are added)
- `npm run web` - Run in web browser

## Build Scripts

The project includes several helper scripts for iOS development:

### `./create-ipa.sh`
Main script for creating an IPA file for device installation:
- Handles Metro bundler startup/shutdown
- Builds and archives for iOS device
- Exports IPA with proper code signing
- Includes error handling and fallback options

### `./setup-code-signing.sh`
One-time setup script for configuring iOS code signing:
- Detects available development teams
- Automatically configures project settings
- Updates bundle identifier
- Provides manual setup instructions

### `./build-simulator.sh`
Alternative build script for iOS Simulator testing:
- No code signing required
- Quick testing without device setup
- Automatically launches simulator

### Usage Examples:
```bash
# First time setup
./setup-code-signing.sh

# Build for device
./create-ipa.sh

# Build for simulator (no signing needed)
./build-simulator.sh
```

## Troubleshooting

### Common iOS Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **Build errors**: Make sure all dependencies are properly installed
3. **Device not detected**: Ensure iPhone and Mac are on the same WiFi network

### For Production Deployment

1. **Apple Developer Account**: Required for App Store distribution
2. **App Store Connect**: Configure your app listing
3. **Code Signing**: Set up proper certificates and provisioning profiles

## License

This project is for personal use. Feel free to modify and adapt for your needs.
