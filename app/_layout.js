import { Stack, router } from "expo-router";
import { Pressable, Text } from "react-native";

const TitleButton = () => (
  <Pressable
    onPress={() => router.push("/")} // ルートに戻る（必要ならパス変更）
    hitSlop={8}
    accessibilityRole="button"
    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
  >
    <Text style={{ fontWeight: "700" }}>MonsterHunterWilds</Text>
  </Pressable>
);

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerTitle: () => <TitleButton />,
        headerShadowVisible: false,
      }}
    />
  );
};

export default Layout;
