// src/components/WeaponPickerModal.js — scoped styles (overlay lighter & not closing when clicking inside)
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, Platform, StyleSheet } from "react-native";
import { loadPresets } from "../lib/weapon_presets";

const palette = {
  panel: "#FFFFFF",
  chip: "#F9FAFB",
  border: "#E5E7EB",
  text: "#111827",
  sub: "#6B7280",
  primary: "#2563EB",
};

const k = StyleSheet.create({
  modalRoot: {
    position: Platform.select({ web: "fixed", default: "absolute" }),
    top: 0, right: 0, bottom: 0, left: 0,
    zIndex: 15000,
    // これで子がそれぞれイベントを受けられる
    pointerEvents: "box-none",
  },
  // 背景。zIndexを下げることでカードより後ろに
  backdrop: {
    position: Platform.select({ web: "fixed", default: "absolute" }),
    top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: "rgba(0,0,0,.18)",
    zIndex: 14000,
  },
  // カードは背景より前面に
  cardWrap: {
    alignItems: "center",
    paddingTop: 64,
    zIndex: 15010,
  },
  card: {
    width: 600, maxWidth: "96%",
    backgroundColor: palette.panel,
    borderRadius: 12,
    borderWidth: 1, borderColor: palette.border,
    ...Platform.select({ web: { boxShadow: "0 10px 32px rgba(0,0,0,.18)" }, default: {} }),
  },
  header: { padding: 12, borderBottomWidth: 1, borderColor: palette.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "700", color: palette.text },
  btnSm: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: palette.border, borderRadius: 8, backgroundColor: palette.panel },
  btnSmTxt: { fontSize: 13, fontWeight: "700", color: palette.text },

  tabs: { flexDirection: "row", gap: 8, padding: 12, paddingBottom: 0 },
  tab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#ECECEC", borderWidth: 1, borderColor: palette.border },
  tabActive: { backgroundColor: "#111", borderColor: "#111" },
  tabTxt: { fontSize: 13, color: "#111", fontWeight: "700" },
  tabTxtActive: { color: "#fff" },

  filters: { flexDirection: "row", gap: 8, alignItems: "center", padding: 12, paddingTop: 10 },
  chipsRow: { flexDirection: "row", gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: palette.chip, borderWidth: 1, borderColor: palette.border },
  chipActive: { backgroundColor: palette.primary, borderColor: palette.primary },
  chipTxt: { fontSize: 13, color: palette.text, fontWeight: "700" },
  chipTxtActive: { color: "#fff" },

  searchInput: { flex: 1, borderWidth: 1, borderColor: palette.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: Platform.select({ web: 8, default: 10 }), backgroundColor: "#fff", fontSize: 16, lineHeight: 20, color: palette.text },

  recent: { paddingHorizontal: 12, paddingBottom: 4 },
  recentTitle: { color: palette.sub, fontSize: 12, marginBottom: 6 },

  list: { maxHeight: 520 },
  item: { paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderColor: palette.border, flexDirection: "row", alignItems: "center", gap: 8 },
  itemName: { fontSize: 14, fontWeight: "700", color: palette.text, flex: 1 },
  itemSub: { fontSize: 12, color: palette.sub },
  itemType: { fontSize: 12, color: palette.sub },
});

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

const RECENT_KEY = "mhwlds_weapon_recent_v1";
let RECENT_MEMO = [];
const recentStore = {
  get() {
    try { if (Platform.OS === "web") return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch {}
    return RECENT_MEMO;
  },
  add(item) {
    try {
      const list = recentStore.get().filter(x => x.key !== item.key);
      list.unshift(item);
      const cut = list.slice(0, 6);
      if (Platform.OS === "web") localStorage.setItem(RECENT_KEY, JSON.stringify(cut));
      else RECENT_MEMO = cut;
    } catch {}
  }
};

const Summary = ({ data }) => {
  const d = data || {};
  const der = d.derived || {};
  const atk = der.atkDisp ?? der.atkTrue ?? "-";
  const aff = der.aff ?? 0;
  const elemName = der.element || "無";
  const elem = (elemName === "無" || !elemName) ? "─" : `${elemName}+${der.elemFinal ?? 0}`;
  return <Text style={k.itemSub} numberOfLines={1}>{`攻撃${atk} / 会心${aff}% / ${elem}`}</Text>;
};

export default function WeaponPickerModal({ visible, onClose, onPick, loadProductionCatalog }){
  const [tab, setTab] = useState("artia");
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [presets, setPresets] = useState([]);
  const [prod, setProd] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (!visible) return;
    setPresets(loadPresets());
    setRecent(recentStore.get());
    (async () => {
      if (!loadProductionCatalog) { setProd([]); return; }
      try {
        const cat = await loadProductionCatalog();
        const finals = (cat?.weapons || []).filter(w => String(w.stage || "").toLowerCase() === "final");
        setProd(finals);
      } catch (e) {
        console.warn("weapon catalog load failed", e);
        setProd([]);
      }
    })();
  }, [visible, loadProductionCatalog]);

  const filterByType = (list) => list.filter(i => type === "all" || (i.weaponType || i.data?.weaponType) === type);
  const filterByQuery = (list) => (!q.trim() ? list : list.filter(i => {
    const t = q.trim().toLowerCase();
    const name = (i.name || i.data?.name || "").toLowerCase();
    const wt = (i.weaponType || i.data?.weaponType || "").toLowerCase();
    return name.includes(t) || wt.includes(t);
  }));

  const recentView = useMemo(() => {
    if (!recent.length) return null;
    return (
      <View style={{ paddingHorizontal: 12, paddingBottom: 4 }}>
        <Text style={k.recentTitle}>最近選んだ武器</Text>
        {recent.map(r => (
          <Pressable key={r.key} style={k.item} onPress={() => pick(r.payload)}>
            <View style={{ flex: 1 }}>
              <Text style={k.itemName} numberOfLines={1}>{r.title}</Text>
              <Summary data={r.payload} />
            </View>
            <Text style={k.itemType}>{WT_LABEL[r.payload.weaponType] || r.payload.weaponType}</Text>
          </Pressable>
        ))}
      </View>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recent]);

  const pick = (payload) => {
    recentStore.add({ key: `${payload.weaponType}:${payload.name || payload.id || Date.now()}`, title: payload.name || "武器", payload });
    onPick?.(payload);
    onClose?.();
  };

  const renderList = (items, source) => {
    const filtered = filterByQuery(filterByType(items));
    if (!filtered.length) return <View style={[k.item, { justifyContent: "center" }]}><Text style={k.itemSub}>（該当なし）</Text></View>;
    return filtered.map((it, idx) => {
      const data = source === "artia" ? it.data : it;
      const title = it.name;
      return (
        <Pressable key={(it.id)||`${source}:${idx}`} style={k.item} onPress={() => pick({ ...data, name: title, source })}>
          <View style={{ flex: 1 }}>
            <Text style={k.itemName} numberOfLines={1}>{title}</Text>
            <Summary data={data} />
          </View>
          <Text style={k.itemType}>{WT_LABEL[(data.weaponType)] || data.weaponType}</Text>
        </Pressable>
      );
    });
  };

  if (!visible) return null;

  return (
    <View style={k.modalRoot}>
      {/* 背景（ここを押すと閉じる） */}
      <Pressable style={k.backdrop} onPress={onClose} />

      {/* カード（ここは押しても閉じない） */}
      <View style={k.cardWrap} pointerEvents="box-none">
        <View style={k.card} pointerEvents="box-none">
          {/* ヘッダ */}
          <View style={k.header}>
            <Text style={k.title}>武器を選択</Text>
            <Pressable onPress={onClose} style={k.btnSm}><Text style={k.btnSmTxt}>閉じる</Text></Pressable>
          </View>

          {/* タブ */}
          <View style={k.tabs}>
            <Pressable onPress={() => setTab("artia")} style={[k.tab, tab==="artia" && k.tabActive]}>
              <Text style={[k.tabTxt, tab==="artia" && k.tabTxtActive]}>アーティア</Text>
            </Pressable>
            <Pressable onPress={() => setTab("prod")} style={[k.tab, tab==="prod" && k.tabActive]}>
              <Text style={[k.tabTxt, tab==="prod" && k.tabTxtActive]}>生産（最終）</Text>
            </Pressable>
          </View>

          {/* フィルタ */}
          <View style={k.filters}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
              <View style={k.chipsRow}>
                {WT.map(w => (
                  <Pressable key={w.id} onPress={() => setType(w.id)} style={[k.chip, type===w.id && k.chipActive]}>
                    <Text style={[k.chipTxt, type===w.id && k.chipTxtActive]}>{w.label}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            <TextInput
              style={k.searchInput}
              placeholder="名前で検索"
              value={q}
              onChangeText={setQ}
            />
          </View>

          {/* 最近 */}
          {recentView}

          {/* 本文 */}
          <ScrollView style={k.list}>
            {tab === "artia" ? renderList(presets, "artia") : renderList(prod, "production")}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
