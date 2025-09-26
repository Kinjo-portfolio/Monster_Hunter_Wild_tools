// app/index.js
import { View, Text, Pressable, ScrollView, Linking } from "react-native";
import { Stack, router } from "expo-router";
import { s } from "../src/screens/home.styles";

const TILES = [
  { key: "equip", emoji: "🛡️", title: "装備シミュレータ", to: "/equip" },
  { key: "damage", emoji: "⚔️", title: "ダメージ計算", to: "/placeholder?title=ダメージ計算" },
  { key: "monster", emoji: "🐲", title: "モンスター図鑑", to: "/placeholder?title=モンスター図鑑" },
];

// ←ここを書き換え
const FEEDBACK_URL = "https://forms.gle/srFtVerRLEq6jHTz9";

const Home = () => {
  const openForm = () => Linking.openURL(FEEDBACK_URL);

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Stack.Screen options={{ title: "トップ" }} />
      <Text style={s.title}>MONSTER HUNTER WILDS</Text>

      <View style={s.grid}>
        {TILES.map((t) => (
          <Pressable key={t.key} style={s.card} onPress={() => router.push(t.to)}>
            <Text style={s.emoji}>{t.emoji}</Text>
            <Text style={s.cardTitle}>{t.title}</Text>
          </Pressable>
        ))}
      </View>

      {/* フィードバックリンク（カード風） */}
      <View style={{ width: "100%", marginTop: 12 }}>
        <Pressable
          accessibilityRole="link"
          onPress={openForm}
          style={[
            s.card,
            {
              alignSelf: "flex-start",
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 14,
              paddingHorizontal: 16,
              maxWidth: 520,
            },
          ]}
        >
          <Text style={s.emoji}>💬</Text>
          <Text style={s.cardTitle}>ご意見・ご要望フォームを開く</Text>
        </Pressable>
        <Text style={{ opacity: 0.6, marginTop: 6, marginLeft: 8 }}>
          ※外部サイト（Googleフォーム）が開きます／匿名・1〜2分
        </Text>
      </View>

      <Text style={s.footer}>©</Text>
    </ScrollView>
  );
};

export default Home;
