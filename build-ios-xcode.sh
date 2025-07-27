#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 iTrack iOS Build Script - Xcode Integration${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Make sure you're in the project root.${NC}"
    exit 1
fi

# Check required tools
echo -e "${BLUE}🔍 Checking required tools...${NC}"

if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ Error: npx not found. Please install Node.js and npm.${NC}"
    exit 1
fi

if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ Error: Xcode command line tools not found.${NC}"
    echo "Please install Xcode from the App Store and run:"
    echo "xcode-select --install"
    exit 1
fi

# Check if user has signed into Xcode
echo -e "${BLUE}🔐 Checking Xcode configuration...${NC}"
XCODE_ACCOUNTS=$(defaults read com.apple.dt.Xcode IDEProvisioningTeams 2>/dev/null | wc -l)
if [ "$XCODE_ACCOUNTS" -lt 2 ]; then
    echo -e "${YELLOW}⚠️ Warning: No Apple ID detected in Xcode.${NC}"
    echo "For automatic signing, please:"
    echo "1. Open Xcode"
    echo "2. Go to Xcode → Preferences → Accounts"
    echo "3. Add your Apple ID"
    echo ""
    echo -e "${BLUE}Continue anyway? (y/n):${NC}"
    read -r continue_build
    if [[ ! $continue_build =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Clean any existing builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
rm -rf ios/
rm -rf build/
mkdir -p build

# Generate native iOS project
echo -e "${BLUE}🔧 Generating native iOS project with Expo prebuild...${NC}"
if ! npx expo prebuild --platform ios --clean; then
    echo -e "${RED}❌ Error: Failed to generate iOS project.${NC}"
    echo "This might be due to:"
    echo "• Network connectivity issues"
    echo "• Invalid app.json configuration"
    echo "• Missing dependencies"
    exit 1
fi

# Verify iOS project was created
if [ ! -d "ios" ]; then
    echo -e "${RED}❌ Error: iOS directory not created.${NC}"
    exit 1
fi

# Check if CocoaPods is installed
if ! command -v pod &> /dev/null; then
    echo -e "${YELLOW}📦 CocoaPods not found. Installing...${NC}"
    echo "This may require your password for sudo:"
    if ! sudo gem install cocoapods; then
        echo -e "${RED}❌ Error: Failed to install CocoaPods.${NC}"
        echo "Alternative installation methods:"
        echo "• brew install cocoapods"
        echo "• Install via RubyGems without sudo (if you have rbenv/rvm)"
        exit 1
    fi
fi

# Navigate to iOS directory and install dependencies
echo -e "${BLUE}📦 Installing iOS dependencies with CocoaPods...${NC}"
cd ios

# Update CocoaPods repo and install
echo "Running pod install (this may take a few minutes)..."
if ! pod install --repo-update; then
    echo -e "${RED}❌ Error: Failed to install CocoaPods dependencies.${NC}"
    echo "Try running these commands manually:"
    echo "• cd ios"
    echo "• pod repo update"
    echo "• pod install"
    echo "• pod update (if needed)"
    cd ..
    exit 1
fi

# Find the correct workspace file
PROJECT_NAME="itrack"  # From app.json slug
WORKSPACE_FILE="${PROJECT_NAME}.xcworkspace"

if [ ! -f "$WORKSPACE_FILE" ]; then
    echo -e "${YELLOW}⚠️ Expected workspace file $WORKSPACE_FILE not found.${NC}"
    echo "Available workspace/project files:"
    ls -la *.xc*
    
    # Try to find any .xcworkspace file
    WORKSPACE_FILE=$(find . -name "*.xcworkspace" -maxdepth 1 | head -n1 | sed 's|./||')
    if [ -n "$WORKSPACE_FILE" ]; then
        echo -e "${BLUE}💡 Found workspace: $WORKSPACE_FILE${NC}"
        PROJECT_NAME=$(basename "$WORKSPACE_FILE" .xcworkspace)
    else
        echo -e "${RED}❌ No workspace file found.${NC}"
        cd ..
        exit 1
    fi
fi

echo -e "${GREEN}✅ Using workspace: $WORKSPACE_FILE${NC}"
echo -e "${GREEN}✅ Project name: $PROJECT_NAME${NC}"

# Get development team information
echo -e "${BLUE}🔍 Detecting signing configuration...${NC}"

# Try to get team ID from security keychain
TEAM_ID=$(security find-identity -v -p codesigning | grep "iPhone Developer\|Apple Development" | head -n1 | sed 's/.*(\([A-Z0-9]*\)).*/\1/')

if [ -n "$TEAM_ID" ] && [ ${#TEAM_ID} -eq 10 ]; then
    echo -e "${GREEN}✅ Found development team: $TEAM_ID${NC}"
    USE_AUTOMATIC_SIGNING="YES"
else
    echo -e "${YELLOW}⚠️ No development team found in keychain.${NC}"
    USE_AUTOMATIC_SIGNING="NO"
    TEAM_ID=""
fi

# Provide user with options
echo ""
echo -e "${PURPLE}📱 Build Options:${NC}"
echo "1. 🏗️  Build and open in Xcode (Recommended for first-time)"
echo "2. 🤖 Automated command-line build"
echo "3. 📁 Just open the workspace in Xcode"
echo ""
echo -e "${BLUE}Choose option (1-3): ${NC}"
read -r build_option

case $build_option in
    1)
        echo -e "${BLUE}🔨 Building project and opening in Xcode...${NC}"
        
        # Build first to check for issues
        if xcodebuild -workspace "$WORKSPACE_FILE" \
            -scheme "$PROJECT_NAME" \
            -configuration Release \
            -sdk iphoneos \
            -derivedDataPath ../build/DerivedData \
            build; then
            
            echo -e "${GREEN}✅ Build successful!${NC}"
            echo -e "${BLUE}📱 Opening workspace in Xcode...${NC}"
            open "$WORKSPACE_FILE"
            
            echo ""
            echo -e "${PURPLE}📋 Next steps in Xcode:${NC}"
            echo "1. 🔐 Configure signing: Select your project → Signing & Capabilities"
            echo "2. ✅ Enable 'Automatically manage signing'"
            echo "3. 👤 Select your Apple ID team"
            echo "4. 📱 Connect your iPhone via USB"
            echo "5. 🎯 Select your iPhone as the destination"
            echo "6. ▶️ Click the play button or Cmd+R to run"
            echo ""
            echo -e "${BLUE}For creating an IPA:${NC}"
            echo "• Product → Archive"
            echo "• Distribute App → Development"
            echo "• Export to folder"
            
        else
            echo -e "${YELLOW}⚠️ Build had issues, but opening Xcode anyway...${NC}"
            open "$WORKSPACE_FILE"
            echo -e "${BLUE}💡 Fix any build errors in Xcode and try again.${NC}"
        fi
        ;;
        
    2)
        echo -e "${BLUE}🤖 Attempting automated build...${NC}"
        
        if [ "$USE_AUTOMATIC_SIGNING" = "YES" ]; then
            echo "Using automatic signing with team: $TEAM_ID"
            
            # Build and archive
            if xcodebuild -workspace "$WORKSPACE_FILE" \
                -scheme "$PROJECT_NAME" \
                -configuration Release \
                -sdk iphoneos \
                -derivedDataPath ../build/DerivedData \
                -archivePath ../build/${PROJECT_NAME}.xcarchive \
                DEVELOPMENT_TEAM="$TEAM_ID" \
                CODE_SIGN_STYLE="Automatic" \
                archive; then
                
                echo -e "${GREEN}✅ Archive created successfully!${NC}"
                
                # Create export options
                cat > ../build/export-options.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <key>teamID</key>
    <string>$TEAM_ID</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>compileBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <false/>
</dict>
</plist>
EOF
                
                # Export IPA
                if xcodebuild -exportArchive \
                    -archivePath ../build/${PROJECT_NAME}.xcarchive \
                    -exportPath ../build/ \
                    -exportOptionsPlist ../build/export-options.plist; then
                    
                    echo -e "${GREEN}🎉 IPA export completed!${NC}"
                    
                    # Find the IPA file
                    IPA_FILE=$(find ../build -name "*.ipa" | head -n1)
                    if [ -n "$IPA_FILE" ]; then
                        cp "$IPA_FILE" "../build/iTrack.ipa"
                        echo -e "${BLUE}📱 IPA ready: build/iTrack.ipa${NC}"
                        echo -e "${BLUE}📏 Size: $(du -h ../build/iTrack.ipa | cut -f1)${NC}"
                    fi
                else
                    echo -e "${YELLOW}⚠️ IPA export failed. Opening archive in Xcode...${NC}"
                    open ../build/${PROJECT_NAME}.xcarchive
                fi
            else
                echo -e "${YELLOW}⚠️ Archive failed. Opening workspace...${NC}"
                open "$WORKSPACE_FILE"
            fi
        else
            echo -e "${YELLOW}⚠️ No signing team found. Opening Xcode for manual configuration...${NC}"
            open "$WORKSPACE_FILE"
        fi
        ;;
        
    3)
        echo -e "${BLUE}📁 Opening workspace in Xcode...${NC}"
        open "$WORKSPACE_FILE"
        ;;
        
    *)
        echo -e "${RED}❌ Invalid option. Opening workspace...${NC}"
        open "$WORKSPACE_FILE"
        ;;
esac

# Return to project root
cd ..

echo ""
echo -e "${GREEN}✅ Setup completed!${NC}"
echo ""
echo -e "${PURPLE}📱 Installation Methods:${NC}"
echo "1. 🖥️  Direct from Xcode (Easiest for development)"
echo "   • Connect iPhone → Select device → Run"
echo ""
echo "2. 📁 IPA Sideloading (If IPA was created)"
echo "   • AltStore: altstore.io"
echo "   • Sideloadly: sideloadly.io"
echo "   • 3uTools: 3u.com"
echo ""
echo "3. 🔧 Xcode Device Manager"
echo "   • Window → Devices and Simulators → Add to device"
echo ""
echo -e "${YELLOW}💡 Pro Tips:${NC}"
echo "• Enable Developer Mode on iPhone: Settings → Privacy & Security → Developer Mode"
echo "• Trust developer certificate: Settings → General → VPN & Device Management"
echo "• Free Apple ID allows 7-day installs, renew weekly"
echo "• For permanent installs, consider paid Apple Developer Program ($99/year)"
echo ""
echo -e "${BLUE}🎉 Your React Native Expo app is ready for iOS!${NC}"
