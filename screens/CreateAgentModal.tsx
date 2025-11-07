import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import type { Voice } from "./VoicesScreen";

interface CreateAgentModalProps {
  visible: boolean;
  selectedVoice: Voice | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface AgentCreationData {
  name: string;
  firstMessage: string;
  language: string;
  prompt: string;
  llm: string;
}

const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  visible,
  selectedVoice,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<AgentCreationData>({
    name: selectedVoice ? `${selectedVoice.name} Agent` : "",
    firstMessage: "Hello! I'm your AI assistant. How can I help you today?",
    language: "en",
    prompt: "You are a helpful AI assistant. Be friendly, knowledgeable, and provide accurate information.",
    llm: "gpt-4o-mini",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof AgentCreationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const createAgent = async () => {
    if (!selectedVoice) {
      Alert.alert("Error", "No voice selected");
      return;
    }

    if (!formData.name.trim() || !formData.firstMessage.trim() || !formData.prompt.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;

      if (!apiKey) {
        throw new Error("ElevenLabs API key not configured");
      }

      // Minimal agent config with only required fields
      const agentConfig = {
        name: formData.name,
        conversation_config: {
          tts: {
            model_id: "eleven_turbo_v2",
            voice_id: selectedVoice.voice_id,
            agent_output_audio_format: "pcm_16000",
          },
          agent: {
            first_message: formData.firstMessage,
            language: formData.language,
            prompt: {
              prompt: formData.prompt,
              llm: formData.llm,
            },
          },
        },
      };

      console.log("📤 Sending minimal agent config:", JSON.stringify(agentConfig, null, 2));

      const response = await fetch("https://api.elevenlabs.io/v1/convai/agents/create", {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentConfig),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Agent creation failed:", response.status, errorText);
        throw new Error(`Failed to create agent: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Agent created successfully:", result);

      Alert.alert(
        "Success",
        `Agent "${formData.name}" created successfully!`,
        [{ text: "OK", onPress: onSuccess }]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Error creating agent:", errorMessage);
      Alert.alert("Error", `Failed to create agent: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!visible || !selectedVoice) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Agent</Text>
            <Text style={styles.subtitle}>Using voice: {selectedVoice.name}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Agent Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                placeholder="Enter agent name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.firstMessage}
                onChangeText={(value) => handleInputChange("firstMessage", value)}
                placeholder="Hello! How can I help you today?"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Language *</Text>
              <TextInput
                style={styles.input}
                value={formData.language}
                onChangeText={(value) => handleInputChange("language", value)}
                placeholder="en"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>System Prompt *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.prompt}
                onChangeText={(value) => handleInputChange("prompt", value)}
                placeholder="You are a helpful AI assistant..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>LLM Model</Text>
              <TextInput
                style={styles.input}
                value={formData.llm}
                onChangeText={(value) => handleInputChange("llm", value)}
                placeholder="gpt-4o-mini"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.createButton, loading && styles.disabledButton]}
              onPress={createAgent}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.createButtonText}>Create Agent</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default CreateAgentModal;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  scrollView: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "#10B981",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});