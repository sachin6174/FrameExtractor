import React, { useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import { launchImageLibrary } from 'react-native-image-picker';
import { FrameExtractor } from './src/services/FrameExtractor';
import { FileSystemUtils } from './src/utils/FileSystemUtils';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const App = () => {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fps, setFps] = useState('1');
  const [mode, setMode] = useState<'fps' | 'all'>('fps');
  const [progress, setProgress] = useState('');
  const [outputFolder, setOutputFolder] = useState('');
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<any>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'ios') {
      const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (result !== RESULTS.GRANTED) {
        console.warn('Photo library permission denied');
      }
    } else if (Platform.OS === 'android') {
      const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
      if (result !== RESULTS.GRANTED) {
        console.warn('Storage permission denied');
      }
    }
  };

  const pickVideo = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        selectionLimit: 1,
      });

      if (result.didCancel) {
        console.log('User cancelled video picker');
      } else if (result.errorCode) {
        console.error('ImagePicker Error: ', result.errorMessage);
        Alert.alert('Error', result.errorMessage || 'Failed to pick video');
      } else if (result.assets && result.assets[0].uri) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message);
    }
  };

  const startExtraction = async () => {
    if (!videoUri || !duration) {
      Alert.alert('Error', 'Please select a video and wait for it to load');
      return;
    }

    setIsExtracting(true);
    setProgress('Starting...');

    try {
      const folder = await FileSystemUtils.createVideoFolder(videoUri);
      setOutputFolder(folder);

      const result = await FrameExtractor.extractFrames(
        videoUri,
        folder,
        {
          mode,
          fps: mode === 'fps' ? parseFloat(fps) : undefined,
        },
        duration,
        (msg) => setProgress(msg)
      );

      if (result.success) {
        Alert.alert('Success', `Extracted ${result.count} frames to: \n${folder}`);
      } else {
        Alert.alert('Error', result.error || 'Extraction failed');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setIsExtracting(false);
      setProgress('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Video Frame Extractor</Text>

        <TouchableOpacity style={styles.button} onPress={pickVideo}>
          <Text style={styles.buttonText}>{videoUri ? 'Change Video' : 'Pick Video'}</Text>
        </TouchableOpacity>

        {videoUri && (
          <View style={styles.videoContainer}>
            <Video
              ref={videoRef}
              source={{ uri: videoUri }}
              style={styles.video}
              controls={true}
              resizeMode="contain"
              paused={false}
              onLoad={(data) => setDuration(data.duration)}
            />
          </View>
        )}

        <View style={styles.settingsCard}>
          <Text style={styles.subtitle}>Extraction Settings</Text>

          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'fps' && styles.activeToggle]}
              onPress={() => setMode('fps')}
            >
              <Text style={mode === 'fps' ? styles.activeToggleText : styles.toggleText}>Frames Per Sec</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'all' && styles.activeToggle]}
              onPress={() => setMode('all')}
            >
              <Text style={mode === 'all' ? styles.activeToggleText : styles.toggleText}>All Frames</Text>
            </TouchableOpacity>
          </View>

          {mode === 'fps' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FPS Rate:</Text>
              <TextInput
                style={styles.input}
                value={fps}
                onChangeText={setFps}
                keyboardType="numeric"
                placeholder="e.g. 1, 0.5, 24"
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.extractButton, isExtracting && styles.disabledButton]}
            onPress={startExtraction}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Extract Frames</Text>
            )}
          </TouchableOpacity>

          {isExtracting && <Text style={styles.progressText}>{progress}</Text>}
        </View>

        {outputFolder ? (
          <View style={styles.folderInfo}>
            <Text style={styles.label}>Last Output Folder:</Text>
            <Text style={styles.pathText} selectable={true}>{outputFolder}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#38bdf8',
    marginBottom: 30,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#38bdf8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  extractButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#064e3b',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  settingsCard: {
    backgroundColor: '#1e293b',
    width: '100%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: '#334155',
  },
  toggleText: {
    color: '#64748b',
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#f8fafc',
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressText: {
    color: '#38bdf8',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  folderInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    width: '100%',
  },
  pathText: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default App;
