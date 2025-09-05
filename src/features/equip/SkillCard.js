import { View, Text, Pressable, Platform } from "react-native";
import { useState } from "react";
import { s } from "../../screens/equip.styles";

const SkillCard = ({
  item,
  curLv,
  onInc,
  onDec,
  onSet,
  onMax,
  menuOpen = false,
  onToggleMenu,
  onCloseMenu,
}) => {
  const [tip, setTip] = useState(false);
  const infoText = (item?.info ?? "").trim() || "説明なし";

  const handleSelect = (n, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    onSet?.(n);
    onCloseMenu?.();
  };

  return (
    <View style={[s.skillBox, curLv > 0 && s.skillBoxSel, menuOpen && s.skillBoxRaised]}>
      {/* タイトル（Web: hover / Mobile: tap） */}
      <Pressable
        onPress={Platform.OS !== "web" ? () => setTip((v) => !v) : undefined}
        onHoverIn={() => setTip(true)}
        onHoverOut={() => setTip(false)}
        style={{ alignItems: "center" }}
      >
        <Text style={s.skillBoxText}>{item.name}</Text>
        <Text style={s.skillBoxSub}>
          {curLv}/{item.maxLevel}
        </Text>
      </Pressable>

      {/* 吹き出し */}
      {tip && (
        <View pointerEvents="none" style={s.tooltipWrap}>
          <View style={s.tooltip}>
            <Text style={s.tooltipText}>{infoText}</Text>
          </View>
          <View style={s.tooltipArrow} />
        </View>
      )}

      {/* 操作行 */}
      <View style={s.stepRow}>
        <Pressable style={s.stepBtnSm} onPress={onDec}>
          <Text style={s.stepTxtSm}>-</Text>
        </Pressable>

        <Pressable style={s.stepBtnSm} onPress={onInc}>
          <Text style={s.stepTxtSm}>+</Text>
        </Pressable>

        {/* Lv セレクタ */}
        <View style={{ position: "relative" }}>
          <Pressable
            style={s.sel}
            onPress={(e) => {
              e?.preventDefault?.();
              e?.stopPropagation?.();
              onToggleMenu?.();
            }}
          >
            <Text style={s.selText}>Lv {curLv}</Text>
          </Pressable>

          {menuOpen && (
            <View style={s.selMenu} pointerEvents="box-none">
              {Array.from({ length: item.maxLevel + 1 }, (_, n) => (
                <Pressable
                  key={n}
                  style={[s.selOpt, n === curLv && s.selOptSel]}
                  onPress={(e) => handleSelect(n, e)}
                >
                  <Text style={s.selOptText}>{n}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Pressable style={s.stepBtnSm} onPress={() => onMax?.()}>
          <Text style={s.stepTxtSm}>MAX</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SkillCard;
