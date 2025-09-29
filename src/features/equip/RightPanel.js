// src/features_equip/RightPanel.js — SUPER版（堅牢フォールバック + 完成UI）
import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { s } from "../../screens/equip.styles";
import { totalAffinityRange } from "../../domains/skills/calculators/affinity";

export default function RightPanel(props) {
  const {
    selected,
    skillMap,
    onChange,
    onSearch,
    onOpenWeaponPicker,
    onClearAll,
    onClearWeapon,
    onClearSkills,
    weapon,
    weaponName,
    weaponSlots,
    weaponSkills,
  } = props;

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
  const toInt = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;

  const normalizeWeaponSkills = (wk, fromProp) => {
    if (Array.isArray(fromProp) && fromProp.length) {
      return fromProp.map(ws => ({
        id: ws.id ?? ws.name,
        name: ws.name ?? ws.id,
        level: toInt(ws.level ?? 1),
        maxLevel: ws.maxLevel ?? ws.max ?? undefined,
      }));
    }
    if (!wk) return [];
    const arr = Array.isArray(wk.skills) ? wk.skills : (Array.isArray(wk["スキル"]) ? wk["スキル"] : []);
    return arr.map(s => ({
      id: s.id ?? s.name ?? s.名称,
      name: s.name ?? s.名称 ?? s.id,
      level: toInt(s.level ?? s.レベル ?? 1),
      maxLevel: s.maxLevel ?? undefined,
    }));
  };

  const normalizeWeaponSlots = (wk, slotsProp) => {
    if (Array.isArray(slotsProp) && slotsProp.length) return slotsProp.filter(n => Number.isFinite(n) && n>0);
    if (!wk) return [];
    if (Array.isArray(wk.slots)) return wk.slots.filter(n=>Number.isFinite(n)&&n>0);
    if (Array.isArray(wk["スロット"])) return wk["スロット"].filter(n=>Number.isFinite(n)&&n>0);
    if (typeof wk.slotString === "string") return parseSlotsString(wk.slotString);
    if (typeof wk["空きスロット"] === "string") return parseSlotsString(wk["空きスロット"]);
    if (Number.isFinite(wk.slot1) || Number.isFinite(wk.slot2) || Number.isFinite(wk.slot3)) {
      return [wk.slot1, wk.slot2, wk.slot3].map(toInt).filter(n=>n>0);
    }
    return [];
  };

  const [locCleared, setLocCleared] = useState(false);
  const hasWeapon = useMemo(() => {
    if (locCleared) return false;
    if (weapon) return true;
    if (weaponName && weaponName !== "未選択") return true;
    if (Array.isArray(weaponSlots) && weaponSlots.length > 0) return true;
    return false;
  }, [weapon, weaponName, weaponSlots, locCleared]);

  const wName = hasWeapon ? (weapon?.name || weapon?.["名前"] || weaponName || "（名称不明）") : "未選択";
  const wSlots = hasWeapon ? normalizeWeaponSlots(weapon, weaponSlots) : [];
  const wSkills = hasWeapon ? normalizeWeaponSkills(weapon, weaponSkills) : [];

  const rowsMap = new Map();
  Object.entries(selected || {})
    .filter(([, lv]) => lv > 0)
    .forEach(([id, lv]) => {
      const sk = skillMap?.get(id);
      const name = sk?.name || id;
      const max = sk?.maxLevel ?? 1;
      rowsMap.set(name, { id, name, max, sel: lv, wpn: 0 });
    });
  for (const ws of wSkills) {
    const nm = ws?.name || ws?.id;
    if (!nm) continue;
    const max = ws?.maxLevel ?? (skillMap?.get(ws?.id || ws?.name)?.maxLevel) ?? undefined;
    if (rowsMap.has(nm)) {
      const r = rowsMap.get(nm);
      r.wpn += (ws?.level ?? 1);
      r.max = r.max || max || 1;
    } else {
      rowsMap.set(nm, { id: ws?.id || nm, name: nm, max: max || 1, sel: 0, wpn: (ws?.level ?? 1) });
    }
  }
  const rows = Array.from(rowsMap.values()).sort((a,b)=>a.name.localeCompare(b.name,"ja"));

  const getSel = (r) => selected?.[r.id] || 0;
  const dec = (r) => props.onChange?.(r.id, Math.max(0, getSel(r) - 1));
  const inc = (r) => {
    const upper = Math.max(0, (r.max || 1) - (r.wpn || 0));
    props.onChange?.(r.id, Math.min(upper, getSel(r) + 1));
  };
  const clr = (r) => props.onChange?.(r.id, 0);

  const canSearch = hasWeapon || rows.length > 0;
  const handleSearch = () => {
    const payload = hasWeapon ? {
      weapon: weapon || null,
      weaponSlots: wSlots,
      weaponSkills: wSkills,
    } : undefined;
    try { props.onSearch?.(payload); } catch { props.onSearch?.(); }
  };

  const handleClearWeapon = () => {
    if (typeof onClearWeapon === "function") onClearWeapon();
    else setLocCleared(true);
  };
  const handleClearSkills = () => {
    if (typeof onClearSkills === "function") return onClearSkills();
    Object.keys(selected || {}).forEach((id) => props.onChange?.(id, 0));
  };
  const handleClearAll = () => { handleClearWeapon(); handleClearSkills(); props.onClearAll?.(); };

  const SlotChip = ({ size }) => (
    <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, borderWidth: 1, borderColor: "#ddd", backgroundColor: "#fafafa", marginRight: 6, marginBottom: 6 }}>
      <Text style={{ fontSize: 12 }}>{`S${size}`}</Text>
    </View>
  );

  return (
    <View style={s.rightPanel}>
      <View style={s.panelSection}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={s.panelHeader}>武器</Text>
          <Pressable onPress={handleClearWeapon} style={[s.stepBtnSm, { backgroundColor: "#f1f5f9", borderColor: "#e2e8f0" }]}>
            <Text style={[s.stepTxtSm, { color: "#334155" }]}>武器だけリセット</Text>
          </Pressable>
        </View>

        <View style={[s.rowThin, { flexDirection: "row", alignItems: "center", minHeight: 40, paddingVertical: 8 }]}>
          <Text style={[s.rowThinText, { flexGrow: 1, flexShrink: 1 }]}>{`選択中の武器：${wName}`}</Text>
          <Pressable onPress={onOpenWeaponPicker} style={s.stepBtnSm} accessibilityRole="button" accessibilityLabel="武器を選択">
            <Text style={s.stepTxtSm}>武器を選択</Text>
          </Pressable>
        </View>

        {wSlots.length > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingTop: 8 }}>
            <Text style={[s.rowThinText, { marginRight: 8 }]}>スロット</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {wSlots.map((sz, i) => <SlotChip key={`${sz}-${i}`} size={sz} />)}
            </View>
          </View>
        )}
      </View>

      <View style={[s.panelSection, { flex: 1 }]}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={s.panelHeader}>選択中スキル</Text>
          <Pressable onPress={handleClearSkills} style={[s.stepBtnSm, { backgroundColor: "#f1f5f9", borderColor: "#e2e8f0" }]}>
            <Text style={[s.stepTxtSm, { color: "#334155" }]}>スキルだけリセット</Text>
          </Pressable>
        </View>

        {rows.length === 0 ? (
          <View style={s.rowThin}><Text style={s.rowThinText}>未選択</Text></View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
            {rows.map((r) => {
              const sel = getSel(r);
              const wpn = r.wpn || 0;
              const maxStr = r.max ? `/${r.max}` : "";
              return (
                <View key={r.name} style={s.rowSel}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowSelName}>{r.name}</Text>
                    {wpn > 0 && <Text style={[s.rowThinText, { marginTop: 2 }]}>{`武器スキル +${wpn}`}</Text>}
                  </View>
                  <View style={s.rowSelCtrls}>
                    <Pressable style={s.stepMini} onPress={() => dec(r)}><Text style={s.stepTxtSm}>-</Text></Pressable>
                    <Text style={s.lvBadge}>{`Lv ${sel}${wpn > 0 ? ` (+${wpn})` : ""}${maxStr}`}</Text>
                    <Pressable style={s.stepMini} onPress={() => inc(r)}><Text style={s.stepTxtSm}>+</Text></Pressable>
                    <Pressable style={s.clearMini} onPress={() => clr(r)}><Text style={s.clearMiniTxt}>×</Text></Pressable>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      <Pressable onPress={handleSearch} disabled={!canSearch} style={[
        s.clearAllBtn,
        { marginBottom: 8, backgroundColor: canSearch ? "#74b2caff" : "#efefef", borderColor: canSearch ? "#74b2caff" : "#efefef" },
      ]}>
        <Text style={[s.clearAllTxt, { color: canSearch ? "#fff" : "#999" }]}>装備を検索</Text>
      </Pressable>
      <Pressable onPress={handleClearAll} style={s.clearAllBtn}>
        <Text style={s.clearAllTxt}>すべてクリア</Text>
      </Pressable>
    </View>
  );
}
