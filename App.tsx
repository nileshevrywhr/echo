import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ElevenLabsProvider } from "@elevenlabs/react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import VoiceAgentScreen from "./screens/VoiceAgentScreen";
import VoiceCloneScreen from "./screens/VoiceCloneScreen";
import VoicesScreen from "./screens/VoicesScreen";

export type RootTabParamList = {
  VoiceAgent: { agentId?: string; agentName?: string } | undefined;
  VoiceClone: undefined;
  Voices: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const App = () => {
  return (
    <ElevenLabsProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: "#007AFF",
            tabBarInactiveTintColor: "#8E8E93",
            headerShown: true,
            headerTitle: "Ersatz Clone of Human Originality",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "800",
              fontSize: 24,
            },
          }}
        >
          <Tab.Screen 
            name="VoiceAgent" 
            component={VoiceAgentScreen}
            options={{
              tabBarLabel: "Agent",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="mic" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="VoiceClone"
            component={VoiceCloneScreen}
            options={{
              tabBarLabel: "Clone",
              tabBarIcon: ({ color, size }) => (
                <MaterialIcons name="record-voice-over" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Voices"
            component={VoicesScreen}
            options={{
              tabBarLabel: "Voices",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="list" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ElevenLabsProvider>
  );
};

export default App;
