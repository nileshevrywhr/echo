import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useConversation } from "@elevenlabs/react-native";
import type { ConversationStatus, Role } from "@elevenlabs/react-native";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { RootTabParamList } from "../App";

interface Agent {
  agent_id: string;
  name: string;
  tags: string[];
  created_at_unix_secs: number;
  access_info: {
    is_creator: boolean;
    creator_name: string;
    creator_email: string;
    role: string;
  };
  last_call_time_unix_secs: number | null;
  archived: boolean;
}

interface AgentsResponse {
  agents: Agent[];
  next_cursor: string | null;
  has_more: boolean;
}

const VoiceAgentScreen = () => {
  const route = useRoute<RouteProp<RootTabParamList, "VoiceAgent">>();
  const { agentId, agentName } = route.params || {};

  const conversation = useConversation({
    onConnect: ({ conversationId }: { conversationId: string }) => {
      console.log("✅ Connected to conversation", conversationId);
      setCurrentConversationId(conversationId);
    },
    onDisconnect: (details) => {
      console.log("❌ Disconnected from conversation", details);
      setCurrentConversationId(null);
    },
    onError: (message: string, context?: Record<string, unknown>) => {
      console.error("❌ Conversation error:", message, context);
    },
    onMessage: ({
      message,
      source,
    }: {
      message: string;
      source: Role;
    }) => {
      console.log(`💬 Message from ${source}:`, message);
    },
    onModeChange: ({ mode }: { mode: "speaking" | "listening" }) => {
      console.log(`🔊 Mode: ${mode}`);
    },
    onStatusChange: ({ status }: { status: ConversationStatus }) => {
      console.log(`📡 Status: ${status}`);
    },
    onCanSendFeedbackChange: ({
      canSendFeedback,
    }: {
      canSendFeedback: boolean;
    }) => {
      console.log(`🔊 Can send feedback: ${canSendFeedback}`);
    }
  });

  const [isStarting, setIsStarting] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentsModalVisible, setAgentsModalVisible] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<{id: string, name: string} | null>(null);

  const fetchAgents = async () => {
    try {
      setAgentsLoading(true);
      const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
      if (!apiKey) {
        console.error("ElevenLabs API key not configured");
        return;
      }
      const response = await fetch("https://api.elevenlabs.io/v1/convai/agents", {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        console.error("Failed to fetch agents:", response.status);
        return;
      }
      const data: AgentsResponse = await response.json();
      setAgents(data.agents);
      console.log(`✅ Fetched ${data.agents.length} agents`);
    } catch (err) {
      console.error("❌ Error fetching agents:", err);
    } finally {
      setAgentsLoading(false);
    }
  };

  const formatDate = (unixTimestamp: number): string => {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleDateString();
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent({ id: agent.agent_id, name: agent.name });
    setAgentsModalVisible(false);
  };

  const handleSubtitlePress = () => {
    if (agents.length === 0 && !agentsLoading) {
      fetchAgents();
    }
    setAgentsModalVisible(true);
  };

  const handleSubmitText = () => {
    if (textInput.trim()) {
      conversation.sendUserMessage(textInput.trim());
      setTextInput("");
      Keyboard.dismiss();
    }
  };

  const startConversation = async () => {
    if (isStarting) return;

    setIsStarting(true);
    try {
      await conversation.startSession({
        agentId: selectedAgent?.id || agentId || process.env.EXPO_PUBLIC_AGENT_ID,
        userId: "demo-user",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setIsStarting(false);
    }
  };

  const endConversation = async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error("Failed to end conversation:", error);
    }
  };

  const toggleMicMute = () => {
    const newMutedState = !isMicMuted;
    setIsMicMuted(newMutedState);
    conversation.setMicMuted(newMutedState);
  };

  const getStatusColor = (status: ConversationStatus): string => {
    switch (status) {
      case "connected":
        return "#10B981";
      case "connecting":
        return "#F59E0B";
      case "disconnected":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: ConversationStatus): string => {
    return status[0].toUpperCase() + status.slice(1);
  };

  const canStart = conversation.status === "disconnected" && !isStarting;
  const canEnd = conversation.status === "connected";

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Voice Agent</Text>
        </View>
        <TouchableOpacity onPress={handleSubtitlePress}>
          <Text style={styles.subtitle}>
            {agentName ? `Agent: ${agentName}` : selectedAgent ? `Agent: ${selectedAgent.name}` : `agentId: ${process.env.EXPO_PUBLIC_AGENT_ID}`}
          </Text>
        </TouchableOpacity>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(conversation.status) },
            ]}
          />
          <Text style={styles.statusText}>
            {getStatusText(conversation.status)}
          </Text>
        </View>

        {conversation.status === "connected" && (
          <View style={styles.conversationIdContainer}>
            <Text style={styles.conversationIdLabel}>Conversation ID:</Text>
            <Text style={styles.conversationIdText}>
              {conversation.getId() || currentConversationId || "N/A"}
            </Text>
          </View>
        )}

        {conversation.status === "connected" && (
          <View style={styles.speakingContainer}>
            <View
              style={[
                styles.speakingDot,
                {
                  backgroundColor: conversation.isSpeaking
                    ? "#8B5CF6"
                    : "#D1D5DB",
                },
              ]}
            />
            <Text
              style={[
                styles.speakingText,
                { color: conversation.isSpeaking ? "#8B5CF6" : "#9CA3AF" },
              ]}
            >
              {conversation.isSpeaking ? "🎤 AI Speaking" : "👂 AI Listening"}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.startButton,
              !canStart && styles.disabledButton,
            ]}
            onPress={startConversation}
            disabled={!canStart}
          >
            <Text style={styles.buttonText}>
              {isStarting ? "Starting..." : "Start Conversation"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.endButton,
              !canEnd && styles.disabledButton,
            ]}
            onPress={endConversation}
            disabled={!canEnd}
          >
            <Text style={styles.buttonText}>End Conversation</Text>
          </TouchableOpacity>
        </View>

        {conversation.status === "connected" && (
          <View style={styles.micControlContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.micButton,
                isMicMuted ? styles.mutedButton : styles.unmutedButton,
              ]}
              onPress={toggleMicMute}
            >
              <Text style={styles.buttonText}>
                {isMicMuted ? "🔇 Unmute" : "🎤 Mute"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {conversation.status === "connected" &&
          conversation.canSendFeedback && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackLabel}>How was that response?</Text>
              <View style={styles.feedbackButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.likeButton]}
                  onPress={() => conversation.sendFeedback(true)}
                >
                  <Text style={styles.buttonText}>👍 Like</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.dislikeButton]}
                  onPress={() => conversation.sendFeedback(false)}
                >
                  <Text style={styles.buttonText}>👎 Dislike</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {conversation.status === "connected" && (
          <View style={styles.messagingContainer}>
            <Text style={styles.messagingLabel}>Send Text Message</Text>
            <TextInput
              style={styles.textInput}
              value={textInput}
              onChangeText={text => {
                setTextInput(text);
                if (text.length > 0) {
                  conversation.sendUserActivity();
                }
              }}
              placeholder="Type your message or context... (Press Enter to send)"
              multiline
              onSubmitEditing={handleSubmitText}
              returnKeyType="send"
              blurOnSubmit={true}
            />
            <View style={styles.messageButtons}>
              <TouchableOpacity
                style={[styles.button, styles.messageButton]}
                onPress={handleSubmitText}
                disabled={!textInput.trim()}
              >
                <Text style={styles.buttonText}>💬 Send Message</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.contextButton]}
                onPress={() => {
                  if (textInput.trim()) {
                    conversation.sendContextualUpdate(textInput.trim());
                    setTextInput("");
                    Keyboard.dismiss();
                  }
                }}
                disabled={!textInput.trim()}
              >
                <Text style={styles.buttonText}>📝 Send Context</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Modal
          visible={agentsModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAgentsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Agent</Text>
              {agentsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text style={styles.loadingText}>Loading agents...</Text>
                </View>
              ) : (
                <FlatList
                  data={agents}
                  keyExtractor={(item) => item.agent_id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.agentItem}
                      onPress={() => handleAgentSelect(item)}
                    >
                      <Text style={styles.agentName}>{item.name}</Text>
                      <Text style={styles.agentDate}>
                        Created: {formatDate(item.created_at_unix_secs)}
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={styles.agentsList}
                />
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAgentsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default VoiceAgentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1F2937",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 32,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  conversationIdContainer: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: "100%",
  },
  conversationIdLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  conversationIdText: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#374151",
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  speakingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  speakingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  speakingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  startButton: {
    backgroundColor: "#10B981",
  },
  endButton: {
    backgroundColor: "#EF4444",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  feedbackContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  feedbackLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: "row",
    gap: 16,
  },
  likeButton: {
    backgroundColor: "#10B981",
  },
  dislikeButton: {
    backgroundColor: "#EF4444",
  },
  messagingContainer: {
    marginTop: 24,
    width: "100%",
  },
  messagingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginBottom: 16,
  },
  messageButtons: {
    flexDirection: "row",
    gap: 16,
  },
  messageButton: {
    backgroundColor: "#3B82F6",
    flex: 1,
  },
  contextButton: {
    backgroundColor: "#4F46E5",
    flex: 1,
  },
  micControlContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  micButton: {
    paddingHorizontal: 24,
  },
  mutedButton: {
    backgroundColor: "#EF4444",
  },
  unmutedButton: {
    backgroundColor: "#059669",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#1F2937",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  agentsList: {
    maxHeight: 300,
  },
  agentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  agentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  agentDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  closeButton: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
