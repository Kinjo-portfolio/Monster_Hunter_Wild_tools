import { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { s } from "../../screens/equip.styles";
import { pickArmorCandidates } from "../../domains/skills/calculators/gear_finder";
import * as armorData from "../../domains/skills/catalog_armor";

const resolveArmorCatalog = () => armorData.catalogArmor || armorData.default || armorData;
const PART_LABELS = { head: "頭", chest: "胴", arms: "腕", waist: "腰", legs: "脚" };

const Section = ({ title, list }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={s.resultSectionTitle}>{title}</Text>
    {list.map((p) => (
      <View key={`${p.part}-${p.name}-${p.variant || "-"}`} style={s.resultCard}>
        <Text style={s.resultName}>{p.name}{p.variant ? `（${p.variant}）` : ""}</Text>
        <Text style={s.resultSub}>
          {p.skills?.length ? p.skills.map((sk) => `${sk.name}+${sk.level}`).join(" / ") : "スキルなし"}
        </Text>
        <Text style={s.resultSub}>スロット: {p.slots?.length ? p.slots.join("-") : "なし"} / 系列: {p.seriesKey || "-"}</Text>
      </View>
    ))}
  </View>
);

const fmtPiece = (p) => (p ? `${p.name}${p.variant ? `（${p.variant}）` : ""}` : "-");

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
            <Text style={s.resultName}>候補 #{i + 1}　幅 {st.coverageWidth}　満たし度 {(st.satisfiedRatio * 100).toFixed(0)}%</Text>
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
                ) : <Text style={s.resultSub}>なし</Text>}
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const EmptyState = ({ hasSelection }) => (
  <View style={[s.resultCard, { alignItems: "center" }]}>
    <Text style={s.resultName}>
      {hasSelection ? "条件に合う装備セットが見つかりませんでした" : "スキルを選んでから検索してください"}
    </Text>
    <Text style={s.resultSub}>
      {hasSelection
        ? "スキル数を減らす / レベルを下げる / 護石や装飾品の在庫を増やすと見つかる可能性があります。"
        : "右パネルでスキルLvを指定して「装備を検索」を押すと、結果が表示されます。"}
    </Text>
  </View>
);

export default function ResultsTab({ selectedSkills = [], armorCatalog, sets = [] }) {
  const catalogArmor = armorCatalog || resolveArmorCatalog();
  const hasSelection = Array.isArray(selectedSkills) && selectedSkills.length > 0;

  // ❗セットが1件以上ある時だけ、補助として部位候補を出す
  const byPart = useMemo(() => {
    if (!hasSelection || !catalogArmor?.armor || !sets?.length) return { head: [], chest: [], arms: [], waist: [], legs: [] };
    return pickArmorCandidates(selectedSkills, catalogArmor, { limitPerPart: 6 });
  }, [selectedSkills, hasSelection, catalogArmor, sets?.length]);

  const noSetFound = hasSelection && (!sets || sets.length === 0);

  return (
    <ScrollView style={{ flex: 1, padding: 12 }}>
      {(!hasSelection || noSetFound)
        ? <EmptyState hasSelection={hasSelection} />
        : <>
            <SetsSection sets={sets} />
            {Object.entries(byPart).map(([k, list]) => list.length ? <Section key={k} title={PART_LABELS[k]||k} list={list} /> : null)}
          </>
      }
    </ScrollView>
  );
}
