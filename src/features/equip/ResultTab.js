
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { s } from "../../screens/equip.styles";
import * as armorData from "../../domains/skills/catalog_armor";

const resolveArmorCatalog = () => armorData.catalogArmor || armorData.default || armorData;

const fmtPiece = (p) => (p ? `${p.name}${p.variant ? `（${p.variant}）` : ""}` : "-");

const DetailBlock = ({ st }) => {
  const d = st.detail || {};
  const allSkills = Array.isArray(st.allSkills) && st.allSkills.length
    ? st.allSkills.map(x => `${x.name}+${x.level}`).join(" / ")
    : "";
  const decoLine = Array.isArray(d.decoList) && d.decoList.length
    ? d.decoList.map(x => `${x.name} ×${x.count}`).join(" / ")
    : (st.decorations?.length ? st.decorations.map(d0 => `${d0.name || d0.skill}(${d0.slot})→+${d0.add||d0.level||1}`).join(" / ") : "なし");

  return (
    <View style={{ marginTop: 8 }}>
      {!!allSkills && <Text style={s.resultSub}>合計スキル：{allSkills}</Text>}
      <Text style={s.resultSub}>装飾品：{decoLine || "なし"}</Text>
      {Array.isArray(d.perSkill) && d.perSkill.length > 0 && (
        <View style={{ marginTop: 6 }}>
          <Text style={s.resultSub}>スキル内訳：</Text>
          {d.perSkill.map((r, idx) => (
            <Text key={idx} style={s.resultSub}>
              {r.name}｜頭{r.head||0} 胴{r.chest||0} 腕{r.arms||0} 腰{r.waist||0} 脚{r.legs||0} 護石{r.talisman||0} 珠{r.deco||0} ＝ 合計{r.total}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

/**
 * ResultTab（差し替え版 v3）
 * - 検索結果カードのみ表示（部位候補セクションは完全に削除）
 * - 自動展開しない／選択したカードのみ展開（controlled/uncontrolled両対応）
 */
const ResultTab = ({ selectedSkills = [], sets = [], selectedIndex, onSelect }) => {
  const hasSelection = Array.isArray(selectedSkills) && selectedSkills.length > 0;

  // controlled / uncontrolled 両対応
  const [localOpen, setLocalOpen] = useState(-1);
  const expanded = typeof selectedIndex === "number" ? selectedIndex : localOpen;

  const handlePress = (i) => {
    if (typeof onSelect === "function") onSelect(i);
    if (typeof selectedIndex !== "number") setLocalOpen(prev => (prev === i ? -1 : i));
  };

  const noSetFound = hasSelection && (!sets || sets.length === 0);

  return (
    <ScrollView style={{ flex: 1, padding: 12 }}>
      {!hasSelection ? (
        <View style={[s.resultCard, { alignItems: "center" }]}>
          <Text style={s.resultName}>スキルを選んでから検索してください</Text>
          <Text style={s.resultSub}>右パネルでスキルLvを指定して「装備を検索」を押すと、結果が表示されます。</Text>
        </View>
      ) : noSetFound ? (
        <View style={[s.resultCard, { alignItems: "center" }]}>
          <Text style={s.resultName}>条件に合う装備セットが見つかりませんでした</Text>
          <Text style={s.resultSub}>スキル数を減らす / レベルを下げる / 護石や装飾品の在庫を増やすと見つかる可能性があります。</Text>
        </View>
      ) : (
        <View style={{ marginBottom: 8 }}>
          <Text style={s.resultSectionTitle}>上位セット候補（押すと詳細）</Text>
          {sets.map((st, i) => {
            const isOpen = expanded === i;
            return (
              <Pressable key={i} onPress={() => handlePress(i)} style={s.resultCard}>
                {/* ヘッダー「候補 # / 幅 / 満たし度」は表示しない */}
                <Text style={s.resultSub}>
                  頭: {fmtPiece(st.pieces.head)} / 胴: {fmtPiece(st.pieces.chest)} / 腕: {fmtPiece(st.pieces.arms)} / 腰: {fmtPiece(st.pieces.waist)} / 脚: {fmtPiece(st.pieces.legs)}
                </Text>
                <Text style={s.resultSub}>
                  護石: {st.talisman ? `${st.talisman.name}（S:${(st.talisman.slots||[]).join("-")||"なし"}）` : "なし"}
                  {"　"}残スロ: {st.leftoverSlots?.length ? st.leftoverSlots.join("-") : "なし"}
                </Text>
                {isOpen && <DetailBlock st={st} />}
              </Pressable>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

export default ResultTab;
