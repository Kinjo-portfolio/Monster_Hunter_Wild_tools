import { View, Text, Pressable } from 'react-native';
import { s } from '../../screens/equip.styles';

const RightPanel = ({ selected, skillMap, onChange, onClearAll }) => {
  const rows = Object.entries(selected)
    .map(([id, lv]) => ({ id, lv, name: skillMap.get(id)?.name ?? '' }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ja'));

  return (
    <View style={s.rightPanel}>
      <Text style={s.panelTitle}>選択中スキル</Text>

      {rows.length === 0 ? (
        <View style={[s.rowThin, { alignItems: 'center' }]}>
          <Text style={s.rowThinText}>未選択</Text>
        </View>
      ) : (
        rows.map(({ id, lv, name }) => (
          <View key={id} style={s.rowSel}>
            <Text style={s.rowSelName} numberOfLines={1}>{name}</Text>
            <View style={s.rowSelCtrls}>
              <Pressable style={s.stepMini} onPress={() => onChange(id, lv - 1)}><Text style={s.stepTxt}>-</Text></Pressable>
              <Text style={s.lvBadge}>Lv.{lv}</Text>
              <Pressable style={s.stepMini} onPress={() => onChange(id, lv + 1)}><Text style={s.stepTxt}>+</Text></Pressable>
              <Pressable style={s.clearMini} onPress={() => onChange(id, 0)}><Text style={s.clearMiniTxt}>✕</Text></Pressable>
            </View>
          </View>
        ))
      )}

      <View style={s.panelSection}>
        <Text style={s.panelHeader}>合計</Text>
        {/* ※合計の実装は後続（affinity 等の計算器で） */}
        <Pressable onPress={onClearAll} style={s.clearAllBtn}>
          <Text style={s.clearAllTxt}>すべてクリア</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default RightPanel;
