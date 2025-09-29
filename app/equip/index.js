// app/(tabs)/equip/index.js — 親（RightPanel.super と整合）
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { Stack } from "expo-router";
import { View, Text, ScrollView, TextInput, Pressable, useWindowDimensions, Platform ,Image} from "react-native";
import { s } from "../../src/screens/equip.styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import catalog from "../../src/domains/skills/catalog";
import { filterSkills } from "../../src/domains/skills/search";
import SkillCard from "../../src/features/equip/SkillCard";
import TagsBar from "../../src/features/equip/TagsBar";
// ★ パスは実プロジェクトに合わせてください（例は features_equip 配下）
import RightPanel from "../../src/features/equip/RightPanel";
import WeaponSettings from "../equip/WeaponSettings";
import ResultsTab from "../../src/features/equip/ResultTab";
import { useSkillSelection } from "../../src/features/equip/useSkillSelection";
import { useHeaderHeight } from "@react-navigation/elements";
import { computeTopSets } from "../../src/domains/skills/calculators/gear_finder";
import { catalogArmor } from "../../src/domains/skills/catalog_armor";
import { catalogDecorations } from "../../src/domains/skills/catalog_decorations";
import { catalogTalismans } from "../../src/domains/skills/catalog_talismans";

import WeaponPickerModal from "../../src/components/WeaponPickerModal";

const ALL_CATS = ["attack", "crit", "utility"];
const ALL_TYPES = ["normal", "series", "group"];

const EquipIcon = require("../../assets/icons/icon_frame_transparent_256.png")

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
      if (!t.length && type === "group")  return ["グループ"];
      return t;
    })(),
    category: sk.category ?? "utility",
    info: (sk.info ?? "").trim(),
  }));

const LevelMenu = ({ ctx, onPick, onClose }) => {
  if (!ctx) return null;
  const { x, y, cur, max } = ctx;
  const posStyle = Platform.select({
    web: { position: "fixed", left: x, top: y },
    default: { position: "absolute", left: x, top: y }
  });
  return (
    <>
      <Pressable style={s.backdrop} onPress={onClose} />
      <View style={[s.selMenu, posStyle]}>
        {Array.from({ length: max + 1 }, (_, n) => (
          <Pressable key={n} style={[s.selOpt, n === cur && s.selOptSel]} onPress={() => { onPick(n); onClose(); }}>
            <Text style={s.selOptText}>{n}</Text>
          </Pressable>
        ))}
      </View>
    </>
  );
};

const circled = { "①":1, "②":2, "③":3, "④":4, "⑤":5, "⑥":6, "⑦":7 };
const parseSlotsString = (s) => {
  if (!s || typeof s !== "string") return [];
  const arr = [];
  for (const ch of s) {
    if (/\d/.test(ch)) arr.push(parseInt(ch, 10));
    else if (circled[ch]) arr.push(circled[ch]);
  }
  if (arr.length) return arr.filter(n => n>0).slice(0, 3);
  const nums = s.replace(/[^\d]/g, " ").trim().split(/\s+/).map(n=>parseInt(n,10)).filter(n=>n>0);
  return nums.slice(0,3);
};

const EquipScreen = () => {
  const normal = catalog?.normal ?? catalog?.normalSkills ?? [];
  const series = catalog?.series ?? catalog?.seriesSkills ?? [];
  const group  = catalog?.group  ?? catalog?.groupSkills  ?? [];

  const listNormal = useMemo(() => normalizeList(normal, "normal"), [normal]);
  const listSeries = useMemo(() => normalizeList(series, "series"), [series]);
  const listGroup  = useMemo(() => normalizeList(group,  "group"),  [group]);
  const allList    = useMemo(() => [...listNormal, ...listSeries, ...listGroup], [listNormal, listSeries, listGroup]);
  const byId = useMemo(() => new Map(allList.map(x => [x.id, x])), [allList]);

  const getMaxLevel = useCallback((id) => byId.get(id)?.maxLevel ?? 1, [byId]);
  const { selected, setLevel, inc, dec, clearAll } = useSkillSelection(getMaxLevel);

  const selectedSkillsForCalc = useMemo(() => {
    return Object.entries(selected)
      .filter(([, lv]) => lv > 0)
      .map(([id, lv]) => {
        const meta = byId.get(id);
        return meta ? { name: meta.name, requiredLevel: lv, type: meta.type } : null;
      })
      .filter(Boolean);
  }, [selected, byId]);

  const [keyword, setKeyword] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const toggleTag = (t, on) => setActiveTags(on ? activeTags.filter(x => x !== t) : [...activeTags, t]);

  const filteredCommon = useMemo(() => filterSkills(allList, keyword, activeTags, ALL_CATS, ALL_TYPES), [allList, keyword, activeTags]);

  const allTags = useMemo(() => {
    const set = new Set();
    for (const it of allList) for (const t of (it.tags ?? [])) {
      const tag = String(t || "").trim();
      if (tag) set.add(tag);
    }
    const prefer = ["攻撃","攻撃力","会心","会心率","会心ダメ","条件","連撃","切れ味","属性","耐性","スタミナ","アイテム補助","戦闘補助","生存","探索・その他","追加ダメージ","シリーズ","グループ"];
    const arr = [...set];
    arr.sort((a, b) => {
      const ia = prefer.indexOf(a), ib = prefer.indexOf(b);
      if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      return a.localeCompare(b, "ja");
    });
    return arr;
  }, [allList]);

  const groupsByTag = useMemo(() => {
    const m = new Map(allTags.map(t => [t, []]));
    for (const it of filteredCommon) for (const raw of (it.tags ?? [])) {
      const t = String(raw || "").trim();
      if (t && m.has(t)) m.get(t).push(it);
    }
    return m;
  }, [allTags, filteredCommon]);

  const tagsToShow = activeTags.length ? activeTags : allTags;

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const headerHeight = useHeaderHeight();
  const HEADER_GAP = 8;
  const headerOffset = (headerHeight && headerHeight > 0 ? headerHeight : (Platform.OS === "web" ? 56 : insets.top )) + HEADER_GAP;
  const isWide = width >= 900;
  const rightW = 320;
  const leftW = width - (isWide ? rightW + 24 : 0) - 32;
  const base = isWide ? 220 : 250;
  let calc = Math.floor(leftW / base);
  const cols = isWide ? Math.min(5, Math.max(3, calc)) : Math.min(3, Math.max(1, calc));
  const colPct = `${(100 / cols).toFixed(6)}%`;

  const [dd, setDd] = useState(null);
  const openDropdown = (id, x, y, cur, max) => setDd({ id, x, y, cur, max });
  const closeDropdown = () => setDd(null);

  const [tab, setTab] = useState("skills");
  const [gearSets, setGearSets] = useState([]);

  // ★ 武器状態とモーダル
  const [weapon, setWeapon] = useState(null);
  const [weaponSlots, setWeaponSlots] = useState([]);
  const [weaponSkills, setWeaponSkills] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  // ★ スキル一覧スクロール制御
  const skillScrollRef = useRef(null);
  const [pendingScrollToSkillsTop, setPendingScrollToSkillsTop] = useState(false);
  const scrollSkillsTopNow = useCallback(() => {
    requestAnimationFrame(() => {
      skillScrollRef.current?.scrollTo?.({ y: 0, animated: true });
    });
  }, []);
  useEffect(() => {
    if (tab === "skills" && pendingScrollToSkillsTop) {
      scrollSkillsTopNow();
      setPendingScrollToSkillsTop(false);
    }
  }, [tab, pendingScrollToSkillsTop, scrollSkillsTopNow]);

  // 検索実行：payload（武器情報）も受けられるように
  const runGearSearch = useCallback((payload) => {
    const opts = { kPerPart: 6, 
      topN: 20 ,
      includeWeaponSlots: payload?.weaponSlots ?? [], 
      weaponSkills: payload?.weaponSkills ?? [],
      weaponName: payload?.weapon?.name ?? payload?.weapon?.["名前"] ?? null,
    };
    

    
    const sets = computeTopSets(
      Object.entries(selected)
        .filter(([, lv]) => lv > 0)
        .map(([id, lv]) => ({ name: byId.get(id)?.name || id, requiredLevel: lv })),
      catalogArmor,
      catalogDecorations,
      catalogTalismans,
      opts
    );
    setGearSets(sets);
    setTab("results");
  }, [selected, byId]);

  // リセット
  const clearWeapon = () => { setWeapon(null); setWeaponSlots([]); setWeaponSkills([]); };
  const clearSkills = () => { clearAll(); };

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: "MonsterHunterWilds" }} />

      {isWide && (
        <View style={[s.rightFixed, { right: 16, top: headerOffset, bottom: 16, width: rightW, zIndex: 2000 }]}>
          <RightPanel
            selected={selected}
            skillMap={byId}
            onChange={setLevel}
            onClearAll={() => { closeDropdown(); clearAll(); setTab("skills"); setPendingScrollToSkillsTop(true); }}
            onSearch={(payload) => runGearSearch(payload)}

            // ★ 武器連携（パネルが正規化するので、そのまま渡せばOK）
            weapon={weapon}
            weaponSlots={weaponSlots}
            weaponSkills={weaponSkills}
            onOpenWeaponPicker={() => setPickerOpen(true)}
            onClearWeapon={clearWeapon}
            onClearSkills={clearSkills}
          />
        </View>
      )}

      <LevelMenu ctx={dd} onPick={(lv) => setLevel(dd.id, lv)} onClose={closeDropdown} />

      <ScrollView ref={skillScrollRef} contentContainerStyle={[s.body, { paddingTop: headerOffset }, isWide && { paddingRight: rightW + 24 }]} keyboardShouldPersistTaps="handled">
        <View style={s.pageHeader}>
          <View style={s.pageBadge}>
            <Image
              source={EquipIcon}
              style={{ width: 20, height: 20, marginRight: 6 }}
              resizeMode="contain"
              accessible
              accessibilityLabel="装備アイコン"
            />
            {/* <Text style={s.pageBadgeIcon}>🛡️</Text> */}
            <Text style={s.pageBadgeText}>装備シミュレータ</Text>
          </View>
        </View>

        <View style={s.tabsRow}>
          <Pressable style={[s.tabBtn, tab === "skills" && s.tabBtnActive]} onPress={() => setTab("skills")}><Text style={[s.tabBtnText, tab === "skills" && s.tabBtnTextActive]}>スキル一覧</Text></Pressable>
          <Pressable style={[s.tabBtn, tab === "weapon" && s.tabBtnActive]} onPress={() => setTab("weapon")}><Text style={[s.tabBtnText, tab === "weapon" && s.tabBtnTextActive]}>武器設定</Text></Pressable>
          <Pressable style={[s.tabBtn, tab === "results" && s.tabBtnActive]} onPress={() => setTab("results")}><Text style={[s.tabBtnText, tab === "results" && s.tabBtnTextActive]}>検索結果</Text></Pressable>
        </View>

        {tab === "results" ? (
            <ResultsTab selectedSkills={Object.entries(selected).filter(([,lv])=>lv>0).map(([id,lv])=>({name: byId.get(id)?.name||id, requiredLevel: lv }))} sets={gearSets} />
        ) : tab === "weapon" ? (
            <WeaponSettings />
        ) : (
          <>
            <View style={s.searchRow}>
              <Text style={s.caption}>検索</Text>
              <View style={s.searchBox}>
                <TextInput value={keyword} onChangeText={setKeyword} placeholder="スキル名・説明・タグで検索" placeholderTextColor="#9AA3AF" returnKeyType="search" style={s.searchInput} clearButtonMode="while-editing" />
                {keyword.length > 0 && (
                  <Pressable onPress={() => setKeyword("")} style={s.searchClear}>
                    <Text style={s.searchClearText}>×</Text>
                  </Pressable>
                )}
              </View>
              <Text style={s.searchMeta}>{filteredCommon.length}/{allList.length}</Text>
            </View>

            <View style={s.tagsRow}>
              <Text style={s.caption}>タグ</Text>
              <TagsBar tags={allTags} active={activeTags} onToggle={toggleTag} />
            </View>

            {([...tagsToShow]).map(tag => {
              const items = groupsByTag.get(tag) ?? [];
              if (items.length === 0) return null;
              return (
                <View key={tag} style={s.groupBox}>
                  <Text style={s.groupTitle}>{tag}</Text>
                  <View style={s.gridWrap}>
                    {items.map(it => {
                      const cur = selected[it.id] ?? 0;
                      return (
                        <View key={it.id} style={{ width: colPct, padding: 6 }}>
                          <SkillCard
                            item={it}
                            curLv={cur}
                            onInc={() => inc(it.id)}
                            onDec={() => dec(it.id)}
                            onSet={(lv) => setLevel(it.id, lv)}
                            onMax={() => setLevel(it.id, it.maxLevel)}
                            onOpenLevel={(x, y) => openDropdown(it.id, x, y, cur, it.maxLevel)}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {!isWide && (
          <View style={{ marginTop: 12 }}>
            <RightPanel
              selected={selected}
              skillMap={byId}
              onChange={setLevel}
              onClearAll={() => { closeDropdown(); clearAll(); setTab("skills"); setPendingScrollToSkillsTop(true); }}
              onSearch={(payload) => runGearSearch(payload)}
              weapon={weapon}
              weaponSlots={weaponSlots}
              weaponSkills={weaponSkills}
              onOpenWeaponPicker={() => setPickerOpen(true)}
              onClearWeapon={clearWeapon}
              onClearSkills={clearSkills}
            />
          </View>
        )}
      </ScrollView>

      <WeaponPickerModal
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(w) => {
          setWeapon(w);
          // slots
          const slots = Array.isArray(w?.slots) ? w.slots :
                        Array.isArray(w?.["スロット"]) ? w["スロット"] :
                        typeof w?.slotString === "string" ? parseSlotsString(w.slotString) :
                        typeof w?.["空きスロット"] === "string" ? parseSlotsString(w["空きスロット"]) :
                        [];
          setWeaponSlots(slots);
          // skills
          const ws = Array.isArray(w?.skills) ? w.skills :
                     Array.isArray(w?.["スキル"]) ? w["スキル"] : [];
          setWeaponSkills(ws);
          setPickerOpen(false);
        }}
      />
    </View>
  );
};

export default EquipScreen;
