#!/bin/bash

#Terminal 1: Start Metro
#npx expo start --dev-client

# Terminal 2: Build and run
#npx expo run:ios

echo "🔨 Creating device IPA for Na Maane! (with Expo dev client)..."

# Install expo-dev-client if not present
if ! grep -q "expo-dev-client" package.json; then
    echo "📦 Installing expo-dev-client..."
    npx expo install expo-dev-client
fi

# Check if iOS project exists or if app name has changed
if [ ! -d "ios" ] || [ ! -d "ios/Na Maane!" ]; then
    echo "📱 iOS project not found or app name changed. Regenerating with dev client..."
    rm -rf ios
    npx expo prebuild --platform ios --clear
    cd ios && pod install && cd ..
fi

# Start Metro bundler in background
echo "🚀 Starting Metro bundler..."
npx expo start --dev-client &
METRO_PID=$!
sleep 10

# Build and archive for device
echo "🏗️ Building and archiving for iOS device..."
xcodebuild -workspace "ios/Na Maane!.xcworkspace" \
    -scheme "Na Maane!" \
    -configuration Release \
    -destination generic/platform=iOS \
    -archivePath "build/Na Maane!.xcarchive" \
    clean archive

# Stop Metro bundler
kill $METRO_PID 2>/dev/null

# Create export options
mkdir -p ios
cat > ios/ExportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>stripSwiftSymbols</key>
    <true/>
</dict>
</plist>
EOF

# Export IPA
echo "📦 Exporting IPA..."
xcodebuild -exportArchive \
    -archivePath "build/Na Maane!.xcarchive" \
    -exportPath build/ \
    -exportOptionsPlist ios/ExportOptions.plist

echo "✅ IPA created: build/Na Maane!.ipa"
echo "📱 This IPA includes Expo dev client and should work with Sideloadly!"