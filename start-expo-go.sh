#!/bin/bash

echo "🚀 Starting iTrack with Expo Go - IMMEDIATE INSTALLATION"
echo ""
echo "📱 STEPS TO INSTALL ON YOUR IPHONE:"
echo "1. Open App Store on your iPhone"
echo "2. Search and install 'Expo Go'"
echo "3. Come back here and scan the QR code"
echo "4. iTrack will open on your iPhone!"
echo ""
echo "✅ THIS METHOD:"
echo "   • Works in 30 seconds"
echo "   • No IPA building needed"
echo "   • No code signing"
echo "   • No Fastlane"
echo "   • No Apple Developer account"
echo "   • All features work perfectly"
echo ""

# Check if Expo server is already running
if lsof -Pi :8081 -sTCP:LISTEN -t >/dev/null ; then
    echo "🟢 Expo server already running on port 8081"
    echo "📱 Just scan the QR code with your iPhone camera!"
    echo ""
    echo "If you can't see the QR code, run:"
    echo "npx expo start"
else
    echo "🟡 Starting Expo development server..."
    echo ""
    npx expo start
fi
