# Navigation Structure

This app uses bottom tab navigation for easy screen management and future expansion.

## Current Structure

```
App.tsx (Root)
├── Bottom Tab Navigator
    ├── VoiceAgent Tab (🎙️)
    │   └── screens/VoiceAgentScreen.tsx
    └── VoiceClone Tab (🎤)
        └── screens/VoiceCloneScreen.tsx
```

## Screens

### VoiceAgentScreen
- Main conversation interface with ElevenLabs AI agent
- Features:
  - Start/end conversation
  - Real-time status indicator
  - Microphone mute/unmute
  - Send text messages
  - Send contextual updates
  - Feedback buttons (like/dislike)

### VoiceCloneScreen
- Voice cloning interface
- Features:
  - Record voice samples
  - Playback recordings
  - Create voice clones via ElevenLabs API
  - Voice name and description input

## Adding New Screens

To add a new screen to the bottom navigation:

1. **Create the screen component** in `screens/` directory:
   ```typescript
   // screens/NewScreen.tsx
   import React from "react";
   import { View, Text, StyleSheet } from "react-native";

   const NewScreen = () => {
     return (
       <View style={styles.container}>
         <Text>New Screen</Text>
       </View>
     );
   };

   export default NewScreen;

   const styles = StyleSheet.create({
     container: {
       flex: 1,
       justifyContent: "center",
       alignItems: "center",
     },
   });
   ```

2. **Update `App.tsx`**:
   
   a. Import the new screen:
   ```typescript
   import NewScreen from "./screens/NewScreen";
   ```

   b. Add to the type definition:
   ```typescript
   export type RootTabParamList = {
     VoiceAgent: undefined;
     VoiceClone: undefined;
     NewScreen: undefined; // Add this
   };
   ```

   c. Add a new Tab.Screen:
   ```typescript
   <Tab.Screen 
     name="NewScreen" 
     component={NewScreen}
     options={{
       title: "New Screen",
       tabBarLabel: "New",
       tabBarIcon: ({ color }) => "🆕",
     }}
   />
   ```

## Navigation Benefits

- **Simple**: Each screen is independent and easy to maintain
- **Scalable**: Adding new screens is straightforward
- **User-friendly**: Bottom tabs provide intuitive navigation
- **Clean**: No complex navigation stacks or nested navigators

## Dependencies

- `@react-navigation/native`
- `@react-navigation/bottom-tabs`
- `react-native-screens`
- `react-native-safe-area-context`
