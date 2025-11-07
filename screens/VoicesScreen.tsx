import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import CreateAgentModal from "./CreateAgentModal";

type VoiceCategory = "generated" | "cloned" | "premade" | "professional" | "famous" | "high_quality";

export interface Voice {
  voice_id: string;
  name: string;
  category: VoiceCategory;
  description: string | null;
  preview_url: string | null;
  available_for_tiers: string[];
  labels: Record<string, string>;
}

interface VoicesResponse {
  voices: Voice[];
  has_more: boolean;
  total_count: number;
  next_page_token: string | null;
}

const VoicesScreen = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);

  const handleVoicePress = (voice: Voice) => {
    setSelectedVoice(voice);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedVoice(null);
  };

  const handleAgentCreated = () => {
    setModalVisible(false);
    setSelectedVoice(null);
    // Optionally refresh voices or show success message
  };

  useEffect(() => {
    console.log("🎯 VoicesScreen mounted, fetching voices...");
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;

      if (!apiKey) {
        throw new Error("ElevenLabs API key not configured. Please set EXPO_PUBLIC_ELEVENLABS_API_KEY in your .env file.");
      }

      const response = await fetch("https://api.elevenlabs.io/v2/voices", {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid API key or insufficient permissions. Please check your ElevenLabs API key.");
        }
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data: VoicesResponse = await response.json();
      setVoices(data.voices);
      console.log(`✅ Fetched ${data.voices.length} voices`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("❌ Error fetching voices:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: VoiceCategory): string => {
    switch (category) {
      case "premade":
        return "#10B981";
      case "cloned":
        return "#3B82F6";
      case "generated":
        return "#8B5CF6";
      case "professional":
        return "#F59E0B";
      case "famous":
        return "#EF4444";
      case "high_quality":
        return "#06B6D4";
      default:
        return "#6B7280";
    }
  };

  const renderVoiceItem = ({ item }: { item: Voice }) => (
    <TouchableOpacity style={styles.voiceItem} onPress={() => handleVoicePress(item)}>
      <View style={styles.voiceHeader}>
        <Text style={styles.voiceName}>{item.name}</Text>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: getCategoryColor(item.category) },
          ]}
        >
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
      {item.description && (
        <Text style={styles.voiceDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={styles.voiceMeta}>
        <Text style={styles.voiceId}>ID: {item.voice_id}</Text>
        <Text style={styles.tiersText}>
          Tiers: {item.available_for_tiers.join(", ")}
        </Text>
      </View>
      <View style={styles.tapHint}>
        <Text style={styles.tapHintText}>Tap to create agent</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Voices</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading voices...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Voices</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ Failed to load voices</Text>
          <Text style={styles.errorSubtext}>
            {error.includes('API key not configured') ?
              'Please set EXPO_PUBLIC_ELEVENLABS_API_KEY in your .env file.' :
              error.includes('401') ?
                'Please check that your ElevenLabs API key is valid and has access to the voices API.' :
                'Please check your internet connection and try again.'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchVoices}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voices</Text>
        <Text style={styles.subtitle}>
          {voices.length} voices available
        </Text>
      </View>

      <FlatList
        data={voices}
        keyExtractor={(item) => item.voice_id}
        renderItem={renderVoiceItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <CreateAgentModal
        visible={modalVisible}
        selectedVoice={selectedVoice}
        onClose={handleModalClose}
        onSuccess={handleAgentCreated}
      />
    </View>
  );
};

export default VoicesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#EF4444",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "600",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 20,
  },
  voiceItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  voiceName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  voiceDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  voiceMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voiceId: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "monospace",
    flex: 1,
  },
  tiersText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
  },
  tapHint: {
    marginTop: 8,
    alignItems: "center",
  },
  tapHintText: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
  },
});