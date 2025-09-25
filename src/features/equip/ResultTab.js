
import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { s } from "../../screens/equip.styles";
import * as armorData from "../../domains/skills/catalog_armor";

const resolveArmorCatalog = () => armorData.catalogArmor || armorData.default || armorData;

const fmtPiece = (p) => (p ? `${p.name}${p.variant ? `（${p.variant}）` : ""}` : "-");

const DetailBlock = ({ st }) => {
  const d = st.detail || {};

  const allSkills =
    Array.isArray(st.allSkills) && st.allSkills.length
      ? st.allSkills.map((x) => `${x.name}+${x.level}`).join(" / ")
      : "";

  // 集計を "珠名【スロ】 * 個数" で並べる
  const fmtList = (list) =>
    list && list.length
      ? list
        .slice()
        .sort((a, b) => {
          const as = +(String(a.name).match(/【(\d+)/)?.[1] || 0);
          const bs = +(String(b.name).match(/【(\d+)/)?.[1] || 0);
          if (bs !== as) return bs - as;               // スロサイズ降順（3→2→1）
          return a.name.localeCompare(b.name, "ja");    // 同サイズは名前順
        })
        .map((x) => `${x.name} * ${x.count}`)
        .join("  ")
      : "なし";

  // buildResultDetail が返す集計を使う（なければ最後にフォールバック）
  const lineWeapon = fmtList(d.decoListWeapon);
  const lineArmor = fmtList(d.decoListArmor);

  // フォールバック（万一 detail が無い場合のみ）
  const fallback =
    st.decorations?.length
      ? st.decorations
        .map((d0) => `${d0.name || d0.skill}【${d0.slot || ""}】 * 1`)
        .join("  ")
      : "なし";

  return (
    <View style={{ marginTop: 8 }}>
      {!!allSkills && <Text style={s.resultSub}>合計スキル：{allSkills}</Text>}

      <Text style={s.resultSub}>
        装飾品(武器)：{lineWeapon !== "なし" ? lineWeapon : fallback}
      </Text>
      <Text style={s.resultSub}>
        装飾品(防具)：{lineArmor}
      </Text>

      {Array.isArray(d.perSkill) && d.perSkill.length > 0 && (
        <View style={{ marginTop: 6 }}>
          <Text style={s.resultSub}>スキル内訳：</Text>
          {(() => {
            // 武器スキルも buildResultDetail 側で加算済み
            const rows = d.perSkill.map(r => ({
              name: r.name,
              head: r.head || 0, chest: r.chest || 0, arms: r.arms || 0,
              waist: r.waist || 0, legs: r.legs || 0, talisman: r.talisman || 0,
              deco: r.deco || 0, weapon: r.weapon || 0, total: r.total || 0,
            }));
            const maxW = Math.max(6, ...rows.map(x => visualWidth(x.name)));
            const TARGET = Math.max(10, Math.min(18, maxW + 2)); // ちょい余白

            return rows.map((r, idx) => (
              <Text key={idx} style={s.resultSub}>
                {padLabelJP(r.name, TARGET)}
                ｜頭{r.head} 胴{r.chest} 腕{r.arms} 腰{r.waist} 脚{r.legs} 護石{r.talisman} 珠{r.deco}
                {/* 武器列も見せたい場合は次の1行のコメントを外す */}
                {/*  武器{r.weapon} */}
                {"  ＝ "}{r.total}
              </Text>
            ));
          })()}
        </View>
      )}

    </View>
  );
};


// 見た目幅（半角=1, 全角=2）を概算
const visualWidth = (s) => {
  let w = 0;
  for (const ch of String(s || "")) {
    const cp = ch.codePointAt(0);
    const full = (cp >= 0x1100) && (
      cp <= 0x115F || cp === 0x2329 || cp === 0x232A ||
      (cp >= 0x2E80 && cp <= 0xA4CF) || (cp >= 0xAC00 && cp <= 0xD7A3) ||
      (cp >= 0xF900 && cp <= 0xFAFF) || (cp >= 0xFE10 && cp <= 0xFE6F) ||
      (cp >= 0xFF00 && cp <= 0xFF60) || (cp >= 0xFFE0 && cp <= 0xFFE6)
    );
    w += full ? 2 : 1;
  }
  return w;
};
// 指定の見た目幅まで全角/半角スペースで埋める
const padLabelJP = (label, target) => {
  const full = "　", half = " ";
  let need = Math.max(0, target - visualWidth(label));
  let pad = "";
  while (need > 0) { pad += (need >= 2 ? (need -= 2, full) : (need--, half)); }
  return label + pad;
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

  // 装飾品を origin ごとに集計し、"珠名【スロ】 * 個数" で並べる
  const formatDecosByOrigin = (all) => {
    const count = (arr) => {
      const m = new Map();
      (arr || []).forEach(d => {
        const key = `${d.name || d.skill}【${d.slot || ""}】`;
        m.set(key, (m.get(key) || 0) + 1);
      });
      const sorted = [...(m.entries())].sort((a, b) => {
        const as = +(String(a[0]).match(/【(\d+)/)?.[1] || 0);
        const bs = +(String(b[0]).match(/【(\d+)/)?.[1] || 0);
        if (bs !== as) return bs - as;                 // スロサイズ降順（3→2→1）
        return a[0].localeCompare(b[0], "ja");         // 同サイズは名前順
      });
      return sorted.length ? sorted.map(([k, c]) => `${k} * ${c}`).join("  ") : "なし";
    };
    const weapon = count((all || []).filter(d => d.origin === "weapon"));
    const armor = count((all || []).filter(d => d.origin !== "weapon"));
    return { weapon, armor };
  };


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
                  護石: {st.talisman ? `${st.talisman.name}（S:${(st.talisman.slots || []).join("-") || "なし"}）` : "なし"}
                  {"\n"}
                  残スロ（防具）: {(st.leftoverArmorSlots && st.leftoverArmorSlots.length) ? st.leftoverArmorSlots.join("-") : "なし"}
                  {"  "}
                  残スロ（武器）: {(st.leftoverWeaponSlots && st.leftoverWeaponSlots.length) ? st.leftoverWeaponSlots.join("-") : "なし"}
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
