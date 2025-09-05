import { useMemo, useState, useCallback } from "react";
import { Stack, router } from "expo-router";
import { View, Text, ScrollView, TextInput, Pressable, useWindowDimensions, Platform } from "react-native";
import { s } from "../../src/screens/equip.styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// データ & 検索
import catalog from "../../src/domains/skills/catalog";
import { filterSkills } from "../../src/domains/skills/search";

// 機能群
import SkillCard from "../../src/features/equip/SkillCard";
import TagsBar from "../../src/features/equip/TagsBar";
import RightPanel from "../../src/features/equip/RightPanel";
import { useSkillSelection } from "../../src/features/equip/useSkillSelection";

// 全カテゴリ/全タイプを対象
const ALL_CATS = ["attack", "crit", "utility"];
const ALL_TYPES = ["normal", "series", "group"];

// 共通整形
const normalizeList = (arr, type) =>
    (arr ?? []).map(sk => ({
        id: sk.id ?? sk.name,
        type,
        name: sk.name,
        maxLevel: sk.maxLevel ?? (Array.isArray(sk.levels) ? sk.levels.length : 1),
        levels: sk.levels ?? [],
        tags: (() => {
            const t = Array.isArray(sk.tags) ? sk.tags.filter(Boolean) : [];
            if (!t.length && type === "series") return ["シリーズ"];
            if (!t.length && type === "group") return ["グループ"];
            return t;
        })(),
        category: sk.category ?? "utility",
        info: (sk.info ?? "").trim(),
    }));

export default function EquipScreen() {
    // === データ整形（normal / series / group を合体） ===
    const normal = catalog?.normal ?? catalog?.normalSkills ?? [];
    const series = catalog?.series ?? catalog?.seriesSkills ?? [];
    const group = catalog?.group ?? catalog?.groupSkills ?? [];

    const listNormal = useMemo(() => normalizeList(normal, "normal"), [normal]);
    const listSeries = useMemo(() => normalizeList(series, "series"), [series]);
    const listGroup = useMemo(() => normalizeList(group, "group"), [group]);
    const allList = useMemo(() => [...listNormal, ...listSeries, ...listGroup], [listNormal, listSeries, listGroup]);

    const byId = useMemo(() => new Map(allList.map(x => [x.id, x])), [allList]);

    // === レベル選択状態 ===
    const getMaxLevel = useCallback((id) => byId.get(id)?.maxLevel ?? 1, [byId]);
    const { selected, setLevel, inc, dec, clearAll } = useSkillSelection(getMaxLevel);

    // === 検索・タグ ===
    const [keyword, setKeyword] = useState("");
    const [activeTags, setActiveTags] = useState([]);
    const toggleTag = (t, on) =>
        setActiveTags(on ? activeTags.filter(x => x !== t) : [...activeTags, t]);

    // すべてのカテゴリ・タイプでフィルタ
    const filteredCommon = useMemo(
        () => filterSkills(allList, keyword, activeTags, ALL_CATS, ALL_TYPES),
        [allList, keyword, activeTags]
    );

    // タグ抽出
    const allTags = useMemo(() => {
        const set = new Set();
        for (const it of allList) {
            for (const t of (it.tags ?? [])) {
                const tag = String(t || "").trim();
                if (tag) set.add(tag);
            }
        }
        const prefer = [
            "攻撃", "攻撃力", "会心", "会心率", "会心ダメ", "条件", "連撃",
            "切れ味", "属性", "属性値", "耐性", "スタミナ",
            "アイテム補助", "戦闘補助", "生存", "探索・その他", "追加ダメージ",
            "シリーズ", "グループ"
        ];
        const arr = [...set];
        arr.sort((a, b) => {
            const ia = prefer.indexOf(a), ib = prefer.indexOf(b);
            if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
            return a.localeCompare(b, "ja");
        });
        return arr;
    }, [allList]);

    // タグ → アイテム
    const groupsByTag = useMemo(() => {
        const m = new Map(allTags.map(t => [t, []]));
        for (const it of filteredCommon) {
            for (const raw of (it.tags ?? [])) {
                const t = String(raw || "").trim();
                if (!t || !m.has(t)) continue;
                m.get(t).push(it);
            }
        }
        return m;
    }, [allTags, filteredCommon]);

    const tagsToShow = activeTags.length ? activeTags : allTags;

    // === ドロップダウン開閉（常に1つだけ） ===
    const [openMenuId, setOpenMenuId] = useState(null);

    // === レイアウト ===
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const headerOffset = Platform.select({ web: 64, default: insets.top + 8 });
    const isWide = width >= 900;
    const rightW = 320;

    const cols = width >= 1200 ? 3 : width >= 760 ? 2 : 1;
    const cardW = cols === 3 ? '32%' : cols === 2 ? '48%' : '100%';

    return (
        <View style={s.container}>
            <Stack.Screen options={{ title: "装備シミュレータ" }} />

            {/* 外側クリックで閉じる透明オーバーレイ */}
            {openMenuId && <Pressable style={s.backdrop} onPress={() => setOpenMenuId(null)} />}

            {isWide && (
                <View style={[s.rightFixed, { right: 16, top: headerOffset, bottom: 16, width: rightW, zIndex: 2000 }]}>
                    <RightPanel selected={selected} skillMap={byId} onChange={setLevel} onClearAll={clearAll} />
                </View>
            )}

            <ScrollView contentContainerStyle={[s.body, { paddingTop: headerOffset }, isWide && { paddingRight: rightW + 24 }]}>
                <Text style={s.h1}>装備シミュレータ</Text>
                <Pressable onPress={() => router.back()} style={s.backBtn}><Text>← トップへ戻る</Text></Pressable>

                {/* 検索 */}
                <View style={s.searchRow}>
                    <Text style={s.caption}>スキル検索</Text>
                    <TextInput style={s.searchInput} placeholder="スキル名で検索" value={keyword} onChangeText={setKeyword} />
                </View>

                {/* タグ */}
                <View style={s.tagsRow}>
                    <Text style={s.caption}>タグ</Text>
                    <TagsBar tags={allTags} active={activeTags} onToggle={toggleTag} />
                </View>

                {/* タグごとに表示 */}
                {tagsToShow.map(tag => {
                    const items = groupsByTag.get(tag) ?? [];
                    if (!items.length) return null;
                    return (
                        <View key={tag} style={s.groupBox}>
                            <Text style={s.groupTitle}># {tag}</Text>
                            <View style={s.grid3}>
                                {items.map(it => (
                                    <View key={it.id} style={[s.cardWrap, { width: cardW }]}>
                                        <SkillCard
                                            item={it}
                                            curLv={selected[it.id] ?? 0}
                                            onInc={() => inc(it.id)}
                                            onDec={() => dec(it.id)}
                                            onSet={(lv) => setLevel(it.id, lv)}
                                            onMax={() => setLevel(it.id, it.maxLevel)}
                                            menuOpen={openMenuId === it.id}
                                            onToggleMenu={() => setOpenMenuId(prev => prev === it.id ? null : it.id)}
                                            onCloseMenu={() => setOpenMenuId(null)}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    );
                })}

                {!isWide && (
                    <View style={{ marginTop: 12 }}>
                        <RightPanel selected={selected} skillMap={byId} onChange={setLevel} onClearAll={clearAll} />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
