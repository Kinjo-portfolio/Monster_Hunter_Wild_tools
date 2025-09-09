// src/features/equip/RightPanel.js

import { View, Text, Pressable, ScrollView } from "react-native";
import { s } from "../../screens/equip.styles";

export default function RightPanel({ selected, skillMap, onChange, onClearAll }) {
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

  return (
    <View style={s.rightPanel}>
      <Text style={s.panelTitle}>選択中スキル</Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
        {rows.length === 0 ? (
          <View style={s.rowThin}><Text style={s.rowThinText}>未選択</Text></View>
        ) : (
          rows.map((r) => (
            <View key={r.id} style={s.rowSel}>
              <Text style={s.rowSelName}>{r.name}</Text>
              <View style={s.rowSelCtrls}>
                <Pressable style={s.stepMini} onPress={() => dec(r)}><Text style={s.stepTxtSm}>-</Text></Pressable>
                <Text style={s.lvBadge}>{`Lv ${r.lv}/${r.max}`}</Text>
                <Pressable style={s.stepMini} onPress={() => inc(r)}><Text style={s.stepTxtSm}>+</Text></Pressable>
                <Pressable style={s.clearMini} onPress={() => clr(r)}><Text style={s.clearMiniTxt}>×</Text></Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Pressable onPress={onClearAll} style={s.clearAllBtn}>
        <Text style={s.clearAllTxt}>すべてクリア</Text>
      </Pressable>
    </View>
  );
}
