import { Stack, router } from "expo-router"
import { Pressable, View, Text, TextInput, ScrollView, useWindowDimensions, Platform } from "react-native"
import { s } from "../../src/screens/equip.styles"
import { useSafeAreaInsets } from "react-native-safe-area-context"


const TAGS = ["攻撃力", "会心率", "シリーズスキル"]
const atkSkills = Array.from({ length: 9 }, () => "スキル名")
const critSkills = Array.from({ length: 9 }, () => "スキル名")

const Chip = ({ label, selected }) => (
    <Pressable style={[s.chip, selected && s.chipSel]}>

        <Text style={[s.chipText, selected && s.chipTextSel]}>{label}</Text>

    </Pressable>
)

const SkillBox = ({ label }) => (
    <Pressable style={s.skillBox}>

        <Text style={s.skillBoxText}>{label}</Text>

    </Pressable>
)

const RightPanel = () => (
    <View style={s.rightPanel}>
        <Text style={s.panelTitle}>選択中スキル</Text>

        {/* 選択スキルのリスト（いまはダミー行） */}
        {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={s.rowThin}>
                <Text style={s.rowThinText}>~~~</Text>
            </View>
        ))}

        {/* 合計会心率（ダミー表示） */}
        <View style={s.panelSection}>
            <Text style={s.panelHeader}>合計会心率</Text>
            <View style={s.kvRow}>
                <Text style={s.kvKey}>最高値：</Text>
                <Text style={s.kvVal}>~~~%</Text>
            </View>
            <View style={s.kvRow}>
                <Text style={s.kvKey}>最低値：</Text>
                <Text style={s.kvVal}>~~~%</Text>
            </View>
        </View>

        {/* 会心詳細（ダミーの表） */}
        <View style={s.panelSection}>
            <Text style={s.panelHeader}>会心詳細</Text>
            <View style={s.tableRow}>
                <Text style={s.cell}>~~~</Text>
                <Text style={s.cell}>~~~%</Text>
            </View>
            <View style={s.tableRow}>
                <Text style={s.cell}>~~~</Text>
                <Text style={s.cell}>~~~%</Text>
            </View>
            <View style={s.tableRow}>
                <Text style={s.cell}>~~~</Text>
                <Text style={s.cell}>~~~%</Text>
            </View>
        </View>
    </View>
)




const EquipScreen = () => {

    // 画面幅によって右パネルを“固定表示”にするかどうかを決める
    const { width } = useWindowDimensions()
    const insets = useSafeAreaInsets()
    const headerOffset = Platform.select({ web: 64, default: insets.top + 8 })
    const isWide = width >= 900 // 2カラム化の閾値（PC/タブレット想定）
    const rightW = 320          // 右パネルの幅
    const goBack = () => router.back()

    
    return (
        <View style={s.container}>
            
            <Stack.Screen options={{ title: "装備シミュレータ" }} />

            
            {isWide && (
                <View style={[
                    s.rightFixed,
                    { right: 16, top: headerOffset, bottom: 16, width: rightW, zIndex: 2000 },
                ]}
                >
                    <RightPanel />
                </View>

            )}

            
            <ScrollView contentContainerStyle={[s.body, isWide && { paddingRight: rightW + 24, paddingTop: headerOffset }]}>
                
                <Text style={s.h1}>装備シミュレータ wip</Text>
                <Pressable onPress={goBack} style={s.backBtn}>
                    <Text>← トップへ戻る</Text>
                </Pressable>

                
                <View style={s.topRow}>
                    <Pressable style={s.topBtn}><Text>武器</Text></Pressable>
                    <Pressable style={s.topBtn}><Text>護石</Text></Pressable>
                </View>

                
                <View style={s.searchRow}>
                    <Text style={s.caption}>スキル検索</Text>
                    <TextInput style={s.searchInput} placeholder="スキル名で検索" />
                </View>

                
                <View style={s.tagsRow}>
                    <Text style={s.caption}>タグ</Text>
                    <View style={s.tagsWrap}>
                        {TAGS.map((t, i) => (
                            <Chip key={t} label={t} selected={i === 0} />
                        ))}
                    </View>
                </View>

                
                <View style={s.groupBox}>
                    <Text style={s.groupTitle}># 攻撃力系</Text>
                    <View style={s.grid3}>
                        {atkSkills.map((x, i) => (
                            <SkillBox key={`a-${i}`} label={x} />
                        ))}
                    </View>
                </View>

                
                <View style={s.groupBox}>
                    <Text style={s.groupTitle}># 会心系</Text>
                    <View style={s.grid3}>
                        {critSkills.map((x, i) => (
                            <SkillBox key={`c-${i}`} label={x} />
                        ))}
                    </View>
                </View>

                
                {!isWide && (
                    <View style={{ marginTop: 12 }}>
                        <RightPanel />
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

export default EquipScreen