// 日本語向けの軽量正規化付きフィルタ
// 使い方: filterSkills(list, keyword, activeTags, cats, types)

const toHankaku = (s) =>
  s.replace(/[\uFF01-\uFF5E]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
   .replace(/\u3000/g, " "); // 全角スペース→半角

const kataToHira = (s) =>
  s.replace(/[\u30A1-\u30FA\u30Fィ\u30F5\u30F6]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  ); // カタカナ→ひらがな

const normalizeJP = (s) => {
  const base = String(s ?? "").toLowerCase();
  const hankaku = toHankaku(base);
  const hira = kataToHira(hankaku);
  return hira.replace(/\s+/g, " ").trim();
};

const inSet = (val, arr) => (arr?.length ? arr.includes(val) : true);

export const filterSkills = (all, keyword, activeTags, cats = [], types = []) => {
  const q = normalizeJP(keyword);
  const terms = q.length ? q.split(" ") : [];

  const scoreOf = (it) => {
    // スコアは「名前優先、タグ次点、説明最後」
    const name = normalizeJP(it.name);
    const tags = normalizeJP((it.tags ?? []).join(" "));
    const info = normalizeJP(it.info ?? "");

    let score = 0;
    for (const t of terms) {
      if (!t) continue;
      if (name.includes(t)) score += name.startsWith(t) ? 5 : 3;
      if (tags.includes(t)) score += 2;
      if (info.includes(t)) score += 1;
    }
    return score;
  };

  const hit = [];
  for (const it of all) {
    if (!inSet(it.category, cats)) continue;
    if (!inSet(it.type, types)) continue;

    // タグフィルタ（AND）
    if (activeTags?.length) {
      const tset = new Set((it.tags ?? []).map(x => String(x)));
      const ok = activeTags.every(t => tset.has(t));
      if (!ok) continue;
    }

    // キーワードが空ならここで通過
    if (!terms.length) {
      hit.push({ it, score: 0 });
      continue;
    }

    const sc = scoreOf(it);
    if (sc > 0) hit.push({ it, score: sc });
  }

  // スコア降順 → 軽い並び調整（攻撃/会心/その他）
  const catOrder = new Map([["attack", 0], ["crit", 1], ["utility", 2]]);
  hit.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const ca = catOrder.get(a.it.category) ?? 9;
    const cb = catOrder.get(b.it.category) ?? 9;
    if (ca !== cb) return ca - cb;
    return String(a.it.name).localeCompare(String(b.it.name), "ja");
  });

  return hit.map(x => x.it);
};

export default filterSkills;
