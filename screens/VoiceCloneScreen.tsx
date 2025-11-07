import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from "react-native";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";

const VoiceCloneScreen = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [voiceName, setVoiceName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  useEffect(() => {
    // Request permissions when component mounts
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Microphone permission is required to record voice samples."
        );
      }
    })();

    return () => {
      // Clean up recording on unmount
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      // Clean up timer
      if (timerInterval) {
        clearInterval(timerInterval);
      }
      // Clean up sound
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMilliseconds = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordedUri(null);
      setRecordingDuration(0);

      // Start timer
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } catch (err) {
      console.error("Failed to start recording", err);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      // Stop timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      console.error("Failed to stop recording", err);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
    }
  };

  const playRecording = async () => {
    if (!recordedUri) return;

    try {
      // Unload previous sound if exists
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      // Load and play the sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true },
        (status) => {
          // Update playback progress
          if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis);
            setPlaybackDuration(status.durationMillis || 0);
            
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlaybackPosition(0);
            }
          }
        }
      );

      setSound(newSound);
      setIsPlaying(true);
    } catch (err) {
      console.error("Failed to play recording", err);
      Alert.alert("Error", "Failed to play recording. Please try again.");
    }
  };

  const stopPlayback = async () => {
    if (!sound) return;

    try {
      await sound.stopAsync();
      setIsPlaying(false);
      setPlaybackPosition(0);
    } catch (err) {
      console.error("Failed to stop playback", err);
    }
  };

  const createVoiceClone = async () => {
    if (!recordedUri || !voiceName.trim()) {
      Alert.alert(
        "Error",
        "Please record a voice sample and provide a name for your voice."
      );
      return;
    }

    setIsProcessing(true);

    try {
      // Create form data for the API
      const formData = new FormData();
      formData.append('name', voiceName.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      
      // Append the audio file directly from the URI
      formData.append('files', {
        uri: recordedUri,
        type: 'audio/wav',
        name: 'voice_sample.wav',
      } as any);

      // Call the voice cloning API
      const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
        method: "POST",
        headers: {
          "xi-api-key": process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || "",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to create voice clone";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail?.message || errorJson.detail || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Show success alert with voice ID
      Alert.alert(
        "Success", 
        `Voice clone created successfully!\n\nVoice ID: ${data.voice_id}\n\nYou can now use this voice ID in your agent configuration.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Reset the form
              setRecordedUri(null);
              setVoiceName("");
              setDescription("");
              setRecordingDuration(0);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error creating voice clone:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create voice clone. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Create Voice Clone</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Voice Name</Text>
        <TextInput
          style={styles.input}
          value={voiceName}
          onChangeText={(text: string) => setVoiceName(text)}
          placeholder="Enter a name for your voice"
          placeholderTextColor="#666"
          editable={!isProcessing}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={(text: string) => setDescription(text)}
          placeholder="Describe your voice (e.g., 'Deep male voice with a slight accent')"
          placeholderTextColor="#666"
          multiline
          numberOfLines={3}
          editable={!isProcessing}
        />
      </View>

      <View style={styles.recordingContainer}>
        <Text style={styles.label}>Record Your Voice</Text>
        <Text style={styles.helperText}>
          Record a clear sample of your voice (at least 30 seconds recommended)
        </Text>

        {isRecording && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              🔴 Recording: {formatDuration(recordingDuration)}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              isRecording ? styles.stopButton : styles.recordButton,
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Text>
          </TouchableOpacity>
        </View>

        {recordedUri && (
          <View style={styles.recordingInfo}>
            <Text style={styles.recordingText}>Recording complete!</Text>
            <Text style={styles.recordingSubtext}>
              Duration: {formatDuration(recordingDuration)} • Ready to create your voice clone
            </Text>
            
            {isPlaying && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(playbackPosition / playbackDuration) * 100}%` }
                    ]} 
                  />
                </View>
                <View style={styles.progressTimeContainer}>
                  <Text style={styles.progressTime}>
                    {formatMilliseconds(playbackPosition)}
                  </Text>
                  <Text style={styles.progressTime}>
                    {formatMilliseconds(playbackDuration)}
                  </Text>
                </View>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.playbackButton, isPlaying && styles.playbackButtonActive]}
              onPress={isPlaying ? stopPlayback : playRecording}
            >
              <Text style={styles.playbackButtonText}>
                {isPlaying ? "⏸ Stop Playback" : "▶️ Play Recording"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.createButton,
          (!recordedUri || !voiceName.trim() || isProcessing) &&
            styles.createButtonDisabled,
        ]}
        onPress={createVoiceClone}
        disabled={!recordedUri || !voiceName.trim() || isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>Create Voice Clone</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  helperText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  recordingContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  timerContainer: {
    alignItems: "center",
    marginVertical: 15,
    padding: 12,
    backgroundColor: "#fff5f5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffcccc",
  },
  timerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ff3b30",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  button: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordButton: {
    backgroundColor: "#ff3b30",
  },
  stopButton: {
    backgroundColor: "#ff3b30",
    opacity: 0.8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  recordingInfo: {
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  recordingText: {
    color: "#34c759",
    fontWeight: "600",
    marginBottom: 4,
  },
  recordingSubtext: {
    color: "#666",
    fontSize: 14,
    marginBottom: 12,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 12,
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
  progressTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  progressTime: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  playbackButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  playbackButtonActive: {
    backgroundColor: "#FF9500",
  },
  playbackButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  createButtonDisabled: {
    backgroundColor: "#a7c7ff",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default VoiceCloneScreen;
