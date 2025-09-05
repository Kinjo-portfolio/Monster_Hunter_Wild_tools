import { View, Text, Pressable, ScrollView } from "react-native";
import { Stack, router } from "expo-router";
import { s } from "../src/screens/home.styles"; 

const TILES = [
  { key: "equip", emoji: "🛡️", title: "装備シミュレータ", to: "/equip" },
  { key: "damage", emoji: "⚔️", title: "ダメージ計算", to: "/placeholder?title=ダメージ計算" },
  { key: "monster", emoji: "🐲", title: "モンスター図鑑", to: "/placeholder?title=モンスター図鑑" },
];

const Home = () => {
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Stack.Screen options={{ title: "トップ" }} />
      <Text style={s.title}>MONSTER HUNTER WILDS</Text>
      <View style={s.grid}>
        {TILES.map(t => (
          <Pressable key={t.key} style={s.card} onPress={() => router.push(t.to)}>
            <Text style={s.emoji}>{t.emoji}</Text>
            <Text style={s.cardTitle}>{t.title}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={s.footer}>© you</Text>
    </ScrollView>
  );
};
export default Home;
