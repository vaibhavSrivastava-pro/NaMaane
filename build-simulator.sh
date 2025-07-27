#!/bin/bash

# Build Na Maane! for iOS Simulator (No Code Signing Required)
# This builds the app for simulator testing without needing a development team

echo "🏗️ Building Na Maane! for iOS Simulator..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if iOS project exists
if [ ! -d "ios" ]; then
    echo "❌ iOS project not found. Run 'npx expo prebuild' first."
    exit 1
fi

echo "🚀 Starting Metro bundler..."
# Start Metro in background
npx expo start --dev-client &
METRO_PID=$!

# Wait a moment for Metro to start
sleep 3

echo "📱 Building for iOS Simulator..."
echo "🎯 Available simulators:"
xcrun simctl list devices | grep "iPhone"

echo ""
echo "🔨 Building and launching on simulator..."

# Build and run on simulator
npx expo run:ios --simulator

echo ""
echo "✅ Build complete!"
echo "🎉 Na Maane! should now be running in the iOS Simulator"
echo ""
echo "📝 App Details:"
echo "   Name: Na Maane!"
echo "   Bundle ID: com.anonymous.EN"
echo "   Platform: iOS Simulator"
echo ""
echo "💡 To test on a physical device:"
echo "   1. Run: ./setup-code-signing.sh"
echo "   2. Configure your development team"
echo "   3. Run: ./create-ipa.sh"
echo ""
echo "🛑 To stop Metro bundler:"
echo "   kill $METRO_PID"
