// WeaponPickerModal.js — wrap chips + 2nd row indent for weapon types
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Platform, StyleSheet } from "react-native";

import { loadPresets } from "../lib/weapon_presets";

import { catalog_weapons as swordShieldCatalog } from "../domains/skills/weapons/catalog_sword_and_shield";
import { catalog_weapons as greatSwordCatalog } from "../domains/skills/weapons/catalog_great_sword";
import { catalog_weapons as longSwordCatalog } from "../domains/skills/weapons/catalog_long_sword"
import { catalog_weapons as dualBladesCatalog } from "../domains/skills/weapons/catalog_dual_blades"
import { catalog_weapons as hummerCatalog } from "../domains/skills/weapons/catalog_hammer";
import { catalog_weapons as lanceCatalog } from "../domains/skills/weapons/catalog_lance";
import { catalog_weapons as gunlanceCatalog } from "../domains/skills/weapons/catalog_gunlance";
import { catalog_weapons as switchAxeCatalog } from "../domains/skills/weapons/catalog_switchaxe";
import { catalog_weapons as huntingHornCatalog } from "../domains/skills/weapons/catalog_hunting_horn";
import { catalog_weapons as insectGlaiveCatalog } from "../domains/skills/weapons/catalog_insect_glaive";
import { catalog_weapons as chargeBladeCatalog } from "../domains/skills/weapons/catalog_charge_blade";
import { catalog_weapons as bowCatalog } from "../domains/skills/weapons/catalog_bow";
import { catalog_weapons as lightBowgunCatalog } from "../domains/skills/weapons/catalog_light_bowgun";
import { catalog_weapons as heavyBowgunCatalog } from "../domains/skills/weapons/catalog_heavy_bowgun"



const palette = {
  panel: "#FFFFFF",
  chip: "#F9FAFB",
  border: "#E5E7EB",
  text: "#111827",
  sub: "#6B7280",
  primary: "#90bdc8ff",
  recentBg: "#FAFAFA",
  danger: "#ac5b5bff",
};

const k = StyleSheet.create({
  modalRoot: {
    position: Platform.select({ web: "fixed", default: "absolute" }),
    top: 0, right: 0, bottom: 0, left: 0,
    zIndex: 15000, pointerEvents: "box-none",
  },
  backdrop: {
    position: Platform.select({ web: "fixed", default: "absolute" }),
    top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: "rgba(0,0,0,.18)", zIndex: 14000,
  },
  cardWrap: { alignItems: "center", paddingTop: 64, zIndex: 15010 },
  card: {
    width: 680, maxWidth: "96%",
    backgroundColor: palette.panel,
    borderRadius: 12, borderWidth: 1, borderColor: palette.border,
    ...Platform.select({ web: { boxShadow: "0 10px 32px rgba(0,0,0,.18)", maxHeight: "86vh" }, default: {} }),
  },

  header: { padding: 12, borderBottomWidth: 1, borderColor: palette.border, gap: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 16, fontWeight: "700", color: palette.text },
  headerRight: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 8 },
  btnSm: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: palette.border, borderRadius: 8, backgroundColor: "#fff" },
  btnSmTxt: { fontSize: 13, fontWeight: "700", color: palette.text },
  searchInput: { flex: 1, minWidth: 200, borderWidth: 1, borderColor: palette.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.select({ web: 8, default: 10 }), fontSize: 16, lineHeight: 20, color: palette.text, backgroundColor: "#fff" },

  tabs: { flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingBottom: 8 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#ECECEC", borderWidth: 1, borderColor: palette.border },
  tabActive: { backgroundColor: "#111", borderColor: "#111" },
  tabTxt: { fontSize: 13, color: "#111", fontWeight: "700" },
  tabTxtActive: { color: "#fff" },

  filters: { gap: 8, paddingHorizontal: 12, paddingBottom: 6 },
  chipsRowWrap: { width: "100%" },
  chipsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: palette.chip, borderWidth: 1, borderColor: palette.border },
  chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  chipTxt: { fontSize: 13, color: palette.text, fontWeight: "700" },
  chipTxtActive: { color: "#fff" },

  sectionLabel: { paddingHorizontal: 12, paddingTop: 8, color: palette.sub, fontSize: 12 },
  list: { maxHeight: Platform.select({ web: "65vh", default: 520 }) },

  item: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderColor: palette.border, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff" },
  itemName: { fontSize: 14, fontWeight: "700", color: palette.text, flex: 1 },
  itemSub: { fontSize: 12, color: palette.sub },
  itemType: { fontSize: 12, color: palette.sub },

  accHeaderRow: { paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderColor: palette.border, backgroundColor: palette.recentBg, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  accHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  accHeaderTxt: { fontSize: 13, fontWeight: "700", color: palette.text },
  accHeaderBtns: { flexDirection: "row", alignItems: "center", gap: 8 },
  clearBtn: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: palette.border, borderRadius: 8, backgroundColor: "#fff" },
  clearBtnTxt: { fontSize: 12, fontWeight: "700", color: palette.danger },

  accListWrap: { marginHorizontal: 8, marginBottom: 6, borderWidth: 1, borderColor: palette.border, borderRadius: 10, overflow: "hidden" },
  accItem: { paddingVertical: 8, paddingHorizontal: 10, borderTopWidth: 1, borderColor: palette.border, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fff" },
  accMeta: { fontSize: 12, color: palette.sub },
  delChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: palette.border, backgroundColor: "#fff" },
  delChipTxt: { fontSize: 12, color: palette.danger, fontWeight: "700" },
});

// weapon type chips
const WT = [
  { id: "all", label: "全武器" },
  { id: "great-sword", label: "大剣" },
  { id: "long-sword", label: "太刀" },
  { id: "sword-shield", label: "片手剣" },
  { id: "dual-blades", label: "双剣" },
  { id: "lance", label: "ランス" },
  { id: "gunlance", label: "ガンランス" },
  { id: "hammer", label: "ハンマー" },
  { id: "hunting-horn", label: "狩猟笛" },
  { id: "switch-axe", label: "スラアク" },
  { id: "charge-blade", label: "チャアク" },
  { id: "insect-glaive", label: "操虫棍" },
  { id: "bow", label: "弓" },
  { id: "lbg", label: "ライト" },
  { id: "hbg", label: "ヘビィ" },
];
const WT_LABEL = Object.fromEntries(WT.map(w => [w.id, w.label]));

// split rows and indent second row
const WT_ROW1_IDS = ["all", "great-sword", "long-sword", "sword-shield", "dual-blades", "lance", "gunlance", "hammer", "hunting-horn"];
const WT_ROW1 = WT.filter(w => WT_ROW1_IDS.includes(w.id));
const WT_ROW2 = WT.filter(w => !WT_ROW1_IDS.includes(w.id));
// 調整値：2段目のインデント（px）
const INDENT_WT_SECOND_ROW = 67;

const ELEMENTS = ["火", "水", "雷", "氷", "龍", "毒", "麻痺", "睡眠", "爆破", "無"];
const SORTS = [
  { key: "attack", label: "攻撃力" },
  { key: "element", label: "属性値" },
  { key: "affinity", label: "会心率" },
];

const RECENT_KEY = "mhwlds_weapon_recent_v1";
let RECENT_MEMO = [];
const recentStore = {
  get() {
    try { if (Platform.OS === "web") return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { }
    return RECENT_MEMO;
  },
  set(list) {
    try {
      if (Platform.OS === "web") localStorage.setItem(RECENT_KEY, JSON.stringify(list));
      else RECENT_MEMO = list;
    } catch { }
  },
  add(item) {
    try {
      const list = recentStore.get().filter(x => x.key !== item.key);
      list.unshift(item);
      const cut = list.slice(0, 10);
      recentStore.set(cut);
    } catch { }
  },
  remove(key) {
    try {
      const list = recentStore.get().filter(x => x.key !== key);
      recentStore.set(list);
    } catch { }
  },
  clear() {
    try { if (Platform.OS === "web") localStorage.removeItem(RECENT_KEY); else RECENT_MEMO = []; } catch { }
  }
};

const getAtk = (d) => d?.derived?.atkDisp ?? d?.攻撃力 ?? 0;
const getAff = (d) => d?.derived?.aff ?? d?.会心 ?? 0;
const getElemType = (d) => d?.derived?.element ?? d?.属性?.種別 ?? "無";
const getElemVal = (d) => d?.derived?.elemFinal ?? d?.属性?.値 ?? 0;
const getSlotsArr = (d) => d?.スロット ?? d?.slots ?? d?.data?.スロット ?? d?.data?.slots ?? [];
const slotText = (arr) => {
  const a = Array.isArray(arr) ? arr : [];
  if (!a.length) return "－";
  return a.map((n) => (n === 3 ? "③" : n === 2 ? "②" : n === 1 ? "①" : "-")).join("");
};

const Summary = ({ data, forceArtia = false }) => {
  const atk = getAtk(data);
  const aff = getAff(data);
  const tp = getElemType(data);
  const ev = getElemVal(data);
  const elem = (tp === "無" || ev == null || ev === 0) ? "─" : `${tp}+${ev}`;
  const slots = forceArtia ? "③③③" : slotText(getSlotsArr(data));
  return <Text style={k.itemSub} numberOfLines={1}>{`攻撃${atk} / 会心${aff}% / ${elem} / スロ${slots}`}</Text>;
};

const dataOf = (it, source) => (source === "artia" ? it.data : it);

export default function WeaponPickerModal({
  visible,
  onClose,
  onPick,
  loadProductionCatalog,
}) {
  const [tab, setTab] = useState("artia");
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [presets, setPresets] = useState([]);
  const [prod, setProd] = useState([]);
  const [recent, setRecent] = useState([]);
  const [recentOpen, setRecentOpen] = useState(true);

  const [elementSet, setElementSet] = useState(new Set());
  const [sortKey, setSortKey] = useState("attack");
  const [asc, setAsc] = useState(false);

  useEffect(() => {
    if (!visible) return;
    try {
      setPresets(loadPresets());
      setRecent(recentStore.get());
    } catch { }

    (async () => {
      try {
        if (loadProductionCatalog) {
          const cat = await loadProductionCatalog();
          const finals = (cat?.weapons || []).filter(w => String(w.stage || "").toLowerCase() === "final");
          setProd(finals.map(w => ({ ...w, weaponType: w.weaponType || "sword-shield" })));
          return;
        }
      } catch (e) {
        console.warn("weapon catalog load failed", e);
      }

      const ssArr = (swordShieldCatalog?.["片手剣"] || []);
      const gsArr = (greatSwordCatalog?.["大剣"] || []);
      const lsArr = (longSwordCatalog?.["太刀"] || [])
      const dbArr = (dualBladesCatalog?.["双剣"] || [])
      const haArr = (hummerCatalog?.["ハンマー"] || [])
      const lnArr = (lanceCatalog?.["ランス"] || []);
      const glArr = (gunlanceCatalog?.["ガンランス"] || []);
      const saArr = (switchAxeCatalog?.["スラッシュアックス"] || []);
      const HHArr = (huntingHornCatalog?.["狩猟笛"] || [])
      const IGArr = (insectGlaiveCatalog?.["操虫棍"] || [])
      const CBArr = (chargeBladeCatalog?.["チャージアックス"] || [])
      const BoArr = (bowCatalog?.["弓"] || [])
      const LBArr = (lightBowgunCatalog?.["ライトボウガン"] || [])
      const HBArr = (heavyBowgunCatalog?.["ヘビィボウガン"] || [])



      const mappedHB = HBArr.map(w => ({
        name: w.名前,
        weaponType: "hbg",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }));
      const mappedLB = LBArr.map(w => ({
        name: w.名前,
        weaponType: "lbg",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }));
      const mappedBo = BoArr.map(w => ({
        name: w.名前,
        weaponType: "bow",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }));
      const mappedCB = CBArr.map(w => ({
        name: w.名前,
        weaponType: "charge-blade",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }));
      const mappedIG = IGArr.map(w => ({
        name: w.名前,
        weaponType: "insect-glaive",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }));
      const mappedHH = HHArr.map(w => ({
        name: w.名前,
        weaponType: "hunting-horn",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }));
      const mappedSS = ssArr.map(w => ({
        name: w.名前,
        weaponType: "sword-shield",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }));
      const mappedGS = gsArr.map(w => ({
        name: w.名前,
        weaponType: "great-sword",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }));
      const mappedLS = lsArr.map(w => ({
        name: w.名前,
        weaponType: "long-sword",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }))
      const mappedDB = dbArr.map(w => ({
        name: w.名前,
        weaponType: "dual-blades",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }))
      const mappedH = haArr.map(w => ({
        name: w.名前,
        weaponType: "hammer",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }))
      const mappedLn = lnArr.map(w => ({
        name: w.名前,
        weaponType: "lance",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }))
      const mappedGl = glArr.map(w => ({
        name: w.名前,
        weaponType: "gunlance",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }))
      const mappedSA = saArr.map(w => ({
        name: w.名前,
        weaponType: "switch-axe",
        derived: {
          atkDisp: w.攻撃力,
          aff: w.会心 ?? 0,
          element: w.属性?.種別 ?? "無",
          elemFinal: w.属性?.値 ?? 0,
        },
        ...w,
      }))
      
      setProd([...mappedHB, ...mappedLB, ...mappedBo, ...mappedCB, ...mappedIG, ...mappedHH, ...mappedSS, ...mappedGS, ...mappedLS, ...mappedDB, ...mappedH, ...mappedLn, ...mappedGl, ...mappedSA]);

    })();
  }, [visible, loadProductionCatalog]);

  const filterByType = (list) => list.filter(i => type === "all" || (i.weaponType || i.data?.weaponType) === type);
  const filterByQuery = (list) => (!q.trim() ? list : list.filter(i => {
    const t = q.trim().toLowerCase();
    const name = (i.name || i.data?.name || i.名前 || "").toLowerCase();
    const wt = (i.weaponType || i.data?.weaponType || "").toLowerCase();
    return name.includes(t) || wt.includes(t);
  }));
  const filterByElement = (list, isArtia) => {
    if (!elementSet.size) return list;
    return list.filter(it => {
      const data = isArtia ? it.data : it;
      return elementSet.has(getElemType(data));
    });
  };
  const sortGeneric = (list, isArtia) => {
    const val = (it) => {
      const d = isArtia ? it.data : it;
      if (sortKey === "attack") return getAtk(d);
      if (sortKey === "element") return getElemVal(d);
      if (sortKey === "affinity") return getAff(d);
      return 0;
    };
    const sgn = asc ? 1 : -1;
    return [...list].sort((a, b) => (val(a) - val(b)) * sgn);
  };

  const pick = (payload) => {
    let out = payload;
    const isArtia = payload?.source === "artia";
    if (isArtia) {
      const slots = getSlotsArr(payload);
      if (!slots || slots.length === 0) {
        out = { ...payload, スロット: [3, 3, 3] };
      }
    }
    try {
      const key = `${out.weaponType}:${out.name || out.名前 || out.id || Date.now()}`;
      const title = out.name || out.名前 || "武器";
      recentStore.add({ key, title, payload: out });
      setRecent(recentStore.get());
    } catch { }
    onPick?.(out);
    onClose?.();
  };

  const removeRecent = (key) => {
    recentStore.remove(key);
    setRecent(recentStore.get());
  };
  const clearRecent = () => {
    recentStore.clear();
    setRecent([]);
  };

  const renderRecent = () => {
    const list = recent;
    return (
      <>
        <View style={k.accHeaderRow}>
          <View style={k.accHeaderLeft}>
            <Pressable onPress={() => setRecentOpen(v => !v)}>
              <Text style={k.accHeaderTxt}>最近 使用した武器 {recentOpen ? "▲" : "▼"}</Text>
            </Pressable>
          </View>
          <View style={k.accHeaderBtns}>
            {list.length > 0 && (
              <Pressable onPress={clearRecent} style={k.clearBtn}>
                <Text style={k.clearBtnTxt}>一括削除</Text>
              </Pressable>
            )}
          </View>
        </View>

        {recentOpen && (
          <View style={k.accListWrap}>
            {list.length === 0 ? (
              <View style={[k.accItem, { justifyContent: "center" }]}>
                <Text style={k.accMeta}>（まだありません）</Text>
              </View>
            ) : (
              list.map((r, idx) => {
                const w = r.payload || {};
                const t = w.name || w.名前 || r.title || "武器";
                const wt = w.weaponType || w.data?.weaponType;
                return (
                  <View key={r.key || idx} style={[k.accItem, idx === 0 && { borderTopWidth: 0 }]}>
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={() => pick(w)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={k.itemName} numberOfLines={1}>{t}</Text>
                        <Summary data={w} forceArtia={w?.source === "artia"} />
                      </View>
                    </Pressable>
                    <Text style={k.itemType}>{WT_LABEL[wt] || wt}</Text>
                    <Pressable onPress={() => removeRecent(r.key)} style={k.delChip}>
                      <Text style={k.delChipTxt}>削除</Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </View>
        )}
      </>
    );
  };

  const dataOf = (it, source) => (source === "artia" ? it.data : it);

  const renderList = (items, source) => {
    let filtered = filterByType(items);
    filtered = filterByQuery(filtered);
    filtered = filterByElement(filtered, source === "artia");
    filtered = sortGeneric(filtered, source === "artia");

    if (!filtered.length) {
      return (
        <ScrollView style={k.list}>
          {renderRecent()}
          <View style={[k.item, { justifyContent: "center" }]}><Text style={k.itemSub}>（該当なし）</Text></View>
        </ScrollView>
      );
    }

    return (
      <ScrollView style={k.list}>
        {renderRecent()}
        {filtered.map((it, idx) => {
          const data = dataOf(it, source);
          const title = it.name || it.名前 || data?.name || data?.名前;

          const craftPayload = () => {
            if (source === "artia") {
              const hasSlots = getSlotsArr(data).length > 0;
              const withSlots = hasSlots ? data : { ...data, スロット: [3, 3, 3] };
              return { ...withSlots, name: title, source };
            }
            return { ...data, name: title, source };
          };

          return (
            <Pressable
              key={(it.id) || `${source}:${idx}`}
              style={k.item}
              onPress={() => pick(craftPayload())}
            >
              <View style={{ flex: 1 }}>
                <Text style={k.itemName} numberOfLines={1}>{title}</Text>
                <Summary data={data} forceArtia={source === "artia"} />
              </View>
              <Text style={k.itemType}>{WT_LABEL[(data.weaponType)] || data.weaponType}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    );
  };

  if (!visible) return null;

  return (
    <View style={k.modalRoot}>
      <Pressable style={k.backdrop} onPress={onClose} />

      <View style={k.cardWrap} pointerEvents="box-none">
        <View style={k.card} pointerEvents="box-none">
          {/* Header */}
          <View style={k.header}>
            <View style={k.headerRow}>
              <Text style={k.title}>武器を選択</Text>
              <View style={k.headerRight}>
                <TextInput
                  style={k.searchInput}
                  placeholder="名前で検索"
                  value={q}
                  onChangeText={setQ}
                />
                <Pressable onPress={onClose} style={k.btnSm}><Text style={k.btnSmTxt}>閉じる</Text></Pressable>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={k.tabs}>
            <Pressable onPress={() => setTab("artia")} style={[k.tab, tab === "artia" && k.tabActive]}>
              <Text style={[k.tabTxt, tab === "artia" && k.tabTxtActive]}>アーティア</Text>
            </Pressable>
            <Pressable onPress={() => setTab("prod")} style={[k.tab, tab === "prod" && k.tabActive]}>
              <Text style={[k.tabTxt, tab === "prod" && k.tabTxtActive]}>生産（最終）</Text>
            </Pressable>
          </View>

          {/* Filters with manual 2-row for weapon types */}
          <View style={k.filters}>
            {/* 武器種 chips（2段構成、2段目はインデント） */}
            <View style={k.chipsRowWrap}>
              <View style={k.chipsRow}>
                {WT_ROW1.map(w => (
                  <Pressable key={w.id} onPress={() => setType(w.id)} style={[k.chip, type === w.id && k.chipActive]}>
                    <Text style={[k.chipTxt, type === w.id && k.chipTxtActive]}>{w.label}</Text>
                  </Pressable>
                ))}
              </View>
              <View style={[k.chipsRow, { marginLeft: INDENT_WT_SECOND_ROW }]}>
                {WT_ROW2.map(w => (
                  <Pressable key={w.id} onPress={() => setType(w.id)} style={[k.chip, type === w.id && k.chipActive]}>
                    <Text style={[k.chipTxt, type === w.id && k.chipTxtActive]}>{w.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* 属性 chips（ふつうに改行） */}
            <View style={k.chipsRowWrap}>
              <View style={k.chipsRow}>
                <Pressable onPress={() => setElementSet(new Set())} style={[k.chip, elementSet.size === 0 && k.chipActive]}>
                  <Text style={[k.chipTxt, elementSet.size === 0 && k.chipTxtActive]}>全属性</Text>
                </Pressable>
                {ELEMENTS.map(el => {
                  const active = elementSet.has(el);
                  return (
                    <Pressable
                      key={el}
                      onPress={() => {
                        setElementSet(prev => {
                          const next = new Set(prev);
                          active ? next.delete(el) : next.add(el);
                          return next;
                        });
                      }}
                      style={[k.chip, active && k.chipActive]}
                    >
                      <Text style={[k.chipTxt, active && k.chipTxtActive]}>{el}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* ソート chips（ふつうに改行） */}
            <View style={k.chipsRowWrap}>
              <View style={k.chipsRow}>
                {SORTS.map(srt => (
                  <Pressable key={srt.key} onPress={() => setSortKey(srt.key)} style={[k.chip, sortKey === srt.key && k.chipActive]}>
                    <Text style={[k.chipTxt, sortKey === srt.key && k.chipTxtActive]}>{srt.label}</Text>
                  </Pressable>
                ))}
                <Pressable onPress={() => setAsc(v => !v)} style={k.chip}>
                  <Text style={k.chipTxt}>{asc ? "昇順 ↑" : "降順 ↓"}</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* List */}
          {tab === "artia"
            ? renderList(presets, "artia")
            : renderList(prod, "production")}
        </View>
      </View>
    </View>
  );
}
