# Video Frame Extractor

A React Native app that extracts frames from videos at original pixel quality. Supports iOS, Android, and macOS.

## Features

- **Dual-Mode Extraction**: Choose between custom FPS rate or extract every single frame
- **Original Quality**: Uses native APIs (`AVAssetImageGenerator` for iOS/macOS, `MediaMetadataRetriever` for Android)
- **Dynamic Folder Management**: Auto-creates dedicated folders for each video's screenshots
- **Live Preview**: Watch the video while extraction happens in the background
- **Progress Tracking**: Real-time feedback on extraction progress
- **Cross-Platform**: Works on iOS, Android, and macOS

## Installation

```bash
npm install
```

### iOS Setup

```bash
cd ios && pod install && cd ..
```

### macOS Setup (Optional)

```bash
cd macos && pod install && cd ..
```

## Running the App

### Start Metro Bundler

```bash
npm start
```

### Run on iOS

**Option 1: Using React Native CLI**
```bash
npx react-native run-ios --simulator="iPhone 16 Pro"
```

**Option 2: Using Xcode (Recommended if you encounter SDK issues)**
1. Open `ios/VideoFrameExtractor.xcworkspace` in Xcode
2. Select a simulator from the device dropdown (e.g., iPhone 16 Pro - iOS 18.6)
3. Press Cmd+R to build and run

### Run on Android

```bash
npx react-native run-android
```

### Run on macOS

```bash
npx react-native run-macos
```

## Usage

1. **Pick a Video**: Tap "Pick Video" to select a video from your device
2. **Watch Preview**: The video will load and you can play it
3. **Configure Settings**:
   - Choose "Frames Per Sec" and enter a rate (e.g., 1, 0.5, 24)
   - Or choose "All Frames" to extract every frame
4. **Extract**: Tap "Extract Frames" to start the process
5. **View Results**: Screenshots are saved to a dedicated folder

## Output Locations

- **iOS**: `Documents/Screenshots/[video_name]_[timestamp]/`
  - Access via Files app (UIFileSharingEnabled is enabled)
- **Android**: `External Storage/Screenshots/[video_name]_[timestamp]/`
- **macOS**: `Documents/Screenshots/[video_name]_[timestamp]/`

## Technical Details

- **Frame Format**: PNG (lossless, original quality)
- **Batch Processing**: Processes frames in batches of 10 to maintain stability
- **Native APIs**: 
  - iOS/macOS: `AVAssetImageGenerator` with quality=1.0
  - Android: `MediaMetadataRetriever`

## Troubleshooting

### iOS Build Issues

If you encounter "iOS 26.2 is not installed" error:

1. Open the project in Xcode: `open ios/VideoFrameExtractor.xcworkspace`
2. Select a simulator with an installed runtime (e.g., iPhone 16 Pro - iOS 18.6)
3. Build from Xcode (Cmd+R)

Alternatively, download iOS 26.2 runtime from Xcode > Settings > Platforms.

### Permissions

The app will request necessary permissions:
- **iOS**: Photo Library access (for video selection)
- **Android**: Storage permissions (for reading videos and saving frames)

## Performance Notes

- Extracting "All Frames" from long videos can take significant time and storage
- Progress indicator keeps you informed during extraction
- Batch processing prevents memory issues

## License

MIT
