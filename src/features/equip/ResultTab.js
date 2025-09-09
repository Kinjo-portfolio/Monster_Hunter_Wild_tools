// src/features/equip/ResultsTab.jsx
import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { s } from "../../screens/equip.styles";
import { pickArmorCandidates } from "../../domains/skills/calculators/gear_finder";

// catalog_armor のエクスポート形式が不明でも動くように柔軟に拾う
import * as armorData from "../../domains/skills/catalog_armor";
const resolveArmorCatalog = () => {
  return (
    armorData.catalogArmor ||
    armorData.default ||
    armorData.catalog ||
    armorData
  );
};

const PART_LABELS = { head: "頭", chest: "胴", arms: "腕", waist: "腰", legs: "脚" };

const Section = ({ title, list }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={s.resultSectionTitle}>{title}</Text>
    {list.map((p) => (
      <View key={`${p.part}-${p.name}-${p.variant || "-"}`} style={s.resultCard}>
        <Text style={s.resultName}>
          {p.name}{p.variant ? `（${p.variant}）` : ""}
        </Text>
        <Text style={s.resultSub}>
          {p.skills?.length
            ? p.skills.map((sk) => `${sk.name}+${sk.level}`).join(" / ")
            : "スキルなし"}
        </Text>
        <Text style={s.resultSub}>
          スロット: {p.slots?.length ? p.slots.join("-") : "なし"} / 系列: {p.seriesKey || "-"}
        </Text>
      </View>
    ))}
  </View>
);

const fmtPiece = (p) => (p ? `${p.name}${p.variant ? `（${p.variant}）` : ""}` : "-");

// セット結果（1カード=全身1件、押すと詳細）
const SetsSection = ({ sets = [] }) => {
  const [open, setOpen] = useState(-1);
  if (!sets.length) return null;

  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={s.resultSectionTitle}>上位セット候補（押すと詳細）</Text>
      {sets.map((st, i) => {
        const expanded = open === i;
        return (
          <Pressable key={i} onPress={() => setOpen(expanded ? -1 : i)} style={s.resultCard}>
            <Text style={s.resultName}>
              候補 #{i + 1}　幅 {st.coverageWidth}　満たし度 {(st.satisfiedRatio * 100).toFixed(0)}%
            </Text>
            <Text style={s.resultSub}>
              頭: {fmtPiece(st.pieces.head)} / 胴: {fmtPiece(st.pieces.chest)} / 腕: {fmtPiece(st.pieces.arms)} / 腰: {fmtPiece(st.pieces.waist)} / 脚: {fmtPiece(st.pieces.legs)}
            </Text>
            <Text style={s.resultSub}>
              護石: {st.talisman ? `${st.talisman.name}（S:${(st.talisman.slots||[]).join("-")||"なし"}）` : "なし"}
              {"　"}残スロ: {st.leftoverSlots?.length ? st.leftoverSlots.join("-") : "なし"}
            </Text>

            {expanded && (
              <View style={{ marginTop: 8 }}>
                <Text style={s.resultSub}>装飾品：</Text>
                {st.decorations?.length ? (
                  <Text style={s.resultSub}>
                    {st.decorations.map(d => `${d.name}(${d.slot})→${d.skill}+${d.add}`).join(" / ")}
                  </Text>
                ) : (
                  <Text style={s.resultSub}>なし</Text>
                )}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const ResultsTab = ({ selectedSkills = [], armorCatalog, sets = [] }) => {
  const catalogArmor = armorCatalog || resolveArmorCatalog();

  const byPart = useMemo(() => {
    if (!catalogArmor?.armor) return { head: [], chest: [], arms: [], waist: [], legs: [] };
    return pickArmorCandidates(selectedSkills, catalogArmor, { limitPerPart: 6 });
  }, [selectedSkills, catalogArmor]);

  return (
    <ScrollView style={{ flex: 1, padding: 12 }}>
      <SetsSection sets={sets} />
      {Object.entries(byPart).map(([partKey, list]) => (
        <Section key={partKey} title={PART_LABELS[partKey] || partKey} list={list} />
      ))}
    </ScrollView>
  );
};

export default ResultsTab;
