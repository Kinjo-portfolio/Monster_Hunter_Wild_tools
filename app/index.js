//トップ画面

import { ScrollView, TextInput, View, Text, Pressable } from "react-native"
import { Link } from "expo-router"
import { s } from "../src/screens/home.styles"


const TILES = [
    { key: "equip", emoji: "🛡️", title: "装備シミュレータ" },
    { key: "damage", emoji: "⚔️", title: "ダメージ計算" },
    { key: "monster", emoji: "🐲", title: "モンスター図鑑" },
    // { key: "material", emoji: "🧪", title: "素材逆引き" },
];


const Tile = ({ emoji, title }) => {

    <Pressable
        style={({ hovered, pressed }) => [
            s.card,
            hovered && s.cardHover,
            pressed && s.cardPressed
        ]}
    >
        <Text style={s.emoji}>{emoji}</Text>

        <Text style={s.cardTitle}>{title}</Text>

        <Text style={s.badge}> 準備中 </Text>
        
    </Pressable>

}

const Home = () => {

    // 縦スク内
    return (
        <ScrollView contentContainerStyle={s.wrap}>

            {/* 見出し */}
            <Text style={s.title}> 計算ツール集 </Text>

            {/* サブのテキストっていうか説明 */}
            <Text style={s.sub}>準備中</Text>

            {/* 検索ボックス */}
            <TextInput

                placeholder="名前で検索"
                style={s.input}
                editable={false}

            />

            <View style={s.grid}>
                {TILES.map(t => (
                    <Link
                        key={t.key}
                        href={`/placeholder?title=${encodeURIComponent(t.title)}`}
                        asChild
                    >
                        <Tile emoji={t.emoji} title={t.title} />
                    </Link>
                ))}
            </View>

            {/* フッター */}
            <Text style={s.footer}>© MonsterHunterWilds_wip</Text>

        </ScrollView>)
}

export default Home