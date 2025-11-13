import { Stack } from "expo-router";
import AppHeader from "../components/AppHeader"; // adjust path if needed

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        // iOS = native modal; Android: force bottom-up slide
        presentation: "modal",
        animation: "slide_from_bottom",
        gestureEnabled: true,

        // show your global header on modal routes
        headerShown: true,
        header: () => <AppHeader />,
      }}
    />
  );
}
