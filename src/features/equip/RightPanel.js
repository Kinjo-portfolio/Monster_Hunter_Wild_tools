// src/features/equip/RightPanel.js — 差し替え版（武器セクション＋モーダル起動）

import { View, Text, Pressable, ScrollView } from "react-native";
import { s } from "../../screens/equip.styles";

export default function RightPanel({
  selected,
  skillMap,
  onChange,
  onClearAll,
  onSearch,
  weaponName,
  onOpenWeaponPicker,
}) {
  const rows = Object.entries(selected || {})
    .filter(([, lv]) => lv > 0)
    .map(([id, lv]) => {
      const sk = skillMap?.get(id);
      return { id, name: sk?.name || id, max: sk?.maxLevel ?? 1, lv };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "ja"));

  const dec = (r) => onChange?.(r.id, Math.max(0, r.lv - 1));
  const inc = (r) => onChange?.(r.id, Math.min(r.max, r.lv + 1));
  const clr = (r) => onChange?.(r.id, 0);

  const canSearch = rows.length > 0;
  const openPicker = () => { if (typeof onOpenWeaponPicker === "function") onOpenWeaponPicker(); };

  return (
    <View style={s.rightPanel}>
      {/* ① 武器セクション */}
      <View style={s.panelSection}>
        <Text style={s.panelHeader}>武器</Text>
        <View style={[s.rowThin, { flexDirection: "row", alignItems: "center", gap: 8 }]}>
          <Text style={[s.rowThinText, { flex: 1 }]} numberOfLines={1}>
            選択中の武器：{weaponName || "未選択"}
          </Text>
          <Pressable onPress={openPicker} accessibilityRole="button" accessibilityLabel="武器を選択" style={s.stepBtnSm}>
            <Text style={s.stepTxtSm}>武器を選択</Text>
          </Pressable>
        </View>
      </View>

      {/* ② 選択中スキル */}
      <View style={[s.panelSection, { flex: 1 }]}>
        <Text style={s.panelHeader}>選択中スキル</Text>
        {rows.length === 0 ? (
          <View style={s.rowThin}><Text style={s.rowThinText}>未選択</Text></View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
            {rows.map((r) => (
              <View key={r.id} style={s.rowSel}>
                <Text style={s.rowSelName}>{r.name}</Text>
                <View style={s.rowSelCtrls}>
                  <Pressable style={s.stepMini} onPress={() => dec(r)}><Text style={s.stepTxtSm}>-</Text></Pressable>
                  <Text style={s.lvBadge}>{`Lv ${r.lv}/${r.max}`}</Text>
                  <Pressable style={s.stepMini} onPress={() => inc(r)}><Text style={s.stepTxtSm}>+</Text></Pressable>
                  <Pressable style={s.clearMini} onPress={() => clr(r)}><Text style={s.clearMiniTxt}>×</Text></Pressable>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* ③ アクション */}
      <Pressable
        onPress={() => canSearch && onSearch?.()}
        disabled={!canSearch}
        style={[
          s.clearAllBtn,
          { marginBottom: 8, backgroundColor: canSearch ? "#2563EB" : "#efefef", borderColor: canSearch ? "#2563EB" : "#efefef" },
        ]}
      >
        <Text style={[s.clearAllTxt, { color: canSearch ? "#fff" : "#999" }]}>装備を検索</Text>
      </Pressable>

      <Pressable onPress={onClearAll} style={s.clearAllBtn}>
        <Text style={s.clearAllTxt}>すべてクリア</Text>
      </Pressable>
    </View>
  );
}
