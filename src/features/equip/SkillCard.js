import { View, Text, Pressable, Platform } from "react-native";
import { useState } from "react";
import { s } from "../../screens/equip.styles";

const SkillCard = ({ item, curLv, onInc, onDec, onSet, onMax, onOpenLevel }) => {
  const [tip, setTip] = useState(false);
  const infoText = (item?.info ?? "").trim() || "説明なし";

  return (
    <View style={[s.skillBox, curLv > 0 && s.skillBoxSel]}>
      {/* タイトル（Web: hover / Mobile: tap） */}
      <Pressable
        onPress={Platform.OS !== "web" ? () => setTip(v => !v) : undefined}
        onHoverIn={() => setTip(true)}
        onHoverOut={() => setTip(false)}
        style={{ alignItems: "center" }}
      >
        <Text style={s.skillBoxText}>{item.name}</Text>
        <Text style={s.skillBoxSub}>{curLv}/{item.maxLevel}</Text>
      </Pressable>

      {tip && (
        <View pointerEvents="none" style={s.tooltipWrap}>
          <View style={s.tooltip}><Text style={s.tooltipText}>{infoText}</Text></View>
          <View style={s.tooltipArrow} />
        </View>
      )}

      {/* 操作行 */}
      <View style={s.stepRow}>
        <Pressable style={s.stepBtnSm} onPress={onDec}><Text style={s.stepTxtSm}>-</Text></Pressable>
        <Pressable style={s.stepBtnSm} onPress={onInc}><Text style={s.stepTxtSm}>+</Text></Pressable>

        {/* Lv（グローバル固定メニューを開く） */}
        <Pressable
          style={s.sel}
          onPress={(e) => {
            const { pageX, pageY } = e.nativeEvent || {};
            onOpenLevel?.(pageX ?? 0, (pageY ?? 0) + 8);
          }}
        >
          <Text style={s.selText}>Lv {curLv}</Text>
        </Pressable>

        <Pressable style={s.stepBtnSm} onPress={() => onMax?.()}>
          <Text style={s.stepTxtSm}>最大</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SkillCard;
