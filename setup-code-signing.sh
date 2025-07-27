#!/bin/bash

# Setup Code Signing for Na Maane! iOS App
# This script helps configure code signing for the iOS project

echo "🔧 Setting up code signing for Na Maane! iOS app..."

# Check if we have Xcode command line tools
if ! command -v xcrun &> /dev/null; then
    echo "❌ Xcode command line tools not found. Please install Xcode first."
    exit 1
fi

echo "📋 Available development teams:"
echo "Run this command to see your available teams:"
echo "xcrun xcodebuild -list -project ios/NaMaane.xcodeproj"
echo ""

echo "📱 To manually configure code signing:"
echo "1. Open the project in Xcode:"
echo "   open ios/NaMaane.xcworkspace"
echo ""
echo "2. Select the 'NaMaane' target in the project navigator"
echo "3. Go to 'Signing & Capabilities' tab"
echo "4. Check 'Automatically manage signing'"
echo "5. Select your development team from the dropdown"
echo "6. Ensure the bundle identifier is unique (e.g., com.yourname.namaane)"
echo ""

echo "💡 Alternative: Build for simulator (no code signing required):"
echo "   npm run ios"
echo "   # or"
echo "   npx expo run:ios --simulator"
echo ""

echo "🔄 If you have a development team ID, you can set it automatically:"
echo "Enter your team ID (leave empty to skip): "
read -r TEAM_ID

if [ ! -z "$TEAM_ID" ]; then
    echo "Setting development team to: $TEAM_ID"
    
    # Update the project.pbxproj file with the team ID
    PROJECT_FILE="ios/NaMaane.xcodeproj/project.pbxproj"
    
    if [ -f "$PROJECT_FILE" ]; then
        # Backup the original file
        cp "$PROJECT_FILE" "$PROJECT_FILE.backup"
        
        # Add development team to build settings
        sed -i '' "s/DEVELOPMENT_TEAM = \"\";/DEVELOPMENT_TEAM = \"$TEAM_ID\";/g" "$PROJECT_FILE"
        sed -i '' "/DEVELOPMENT_TEAM = \"\";/d" "$PROJECT_FILE"
        
        # Add team ID if not present
        if ! grep -q "DEVELOPMENT_TEAM = \"$TEAM_ID\"" "$PROJECT_FILE"; then
            sed -i '' "/CODE_SIGN_STYLE = Automatic;/a\\
				DEVELOPMENT_TEAM = \"$TEAM_ID\";\\
" "$PROJECT_FILE"
        fi
        
        echo "✅ Development team set in project file"
        echo "📱 You can now try running the build script again:"
        echo "   ./create-ipa.sh"
    else
        echo "❌ Project file not found: $PROJECT_FILE"
    fi
else
    echo "⏭️  Skipping automatic team setup"
fi

echo ""
echo "🔍 Useful commands:"
echo "  # List available simulators"
echo "  xcrun simctl list devices"
echo ""
echo "  # Build for simulator"
echo "  npm run ios"
echo ""
echo "  # Open in Xcode"
echo "  open ios/NaMaane.xcworkspace"
echo ""
echo "  # Try the build script again"
echo "  ./create-ipa.sh"
