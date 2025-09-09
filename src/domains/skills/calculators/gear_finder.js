// src/domains/skills/calculators/gear_finder.js
// 装備候補ピックアップ & 5部位セット自動探索（装飾品＋護石で不足補完）
// "つけられるスキルの幅"（残スロで新規に盛れるスキル種類数）で並べ替え

// ---------- ユーティリティ ----------
const arr = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

// selectedSkills を {name -> requiredLevel} に正規化
const toRequiredMap = (selectedSkills = []) => {
  const need = new Map();
  selectedSkills.forEach((s) => {
    if (!s) return;
    if (typeof s === "string") {
      need.set(s, Math.max(1, need.get(s) || 0));
    } else if (s.name) {
      const req = s.requiredLevel ?? s.level ?? s.lv ?? 1;
      need.set(s.name, Math.max(req, need.get(s.name) || 0));
    }
  });
  return need;
};

// seriesSkill名 -> series.key の逆引き
const indexSeriesBySkill = (armorCatalog) => {
  const m = new Map();
  (armorCatalog.series || []).forEach((s) => {
    const nm = s?.seriesSkill?.name;
    if (nm && s?.key) m.set(nm, s.key);
  });
  return m;
};

// series.key -> [閾値配列] の逆引き（なければ [2]）
const indexSeriesThresholds = (armorCatalog) => {
  const m = new Map();
  (armorCatalog.series || []).forEach((s) => {
    const th = s?.seriesSkill?.thresholds || s?.thresholds || s?.seriesSkill?.pieces || [2];
    if (s?.key) m.set(s.key, th);
  });
  return m;
};

// decorations を skill名ごとにインデックス化（slot/level効率で並べる）
const indexDecorationsBySkill = (decoCatalog) => {
  const map = new Map();
  (decoCatalog?.decorations || []).forEach((d) => {
    (d.skills || []).forEach((sk) => {
      const list = map.get(sk.name) || [];
      list.push({ key: d.key, name: d.name, slot: d.slot, level: sk.level || 1 });
      map.set(sk.name, list);
    });
  });
  for (const [k, list] of map) {
    list.sort((a, b) => {
      const ra = a.slot / Math.max(1, a.level);
      const rb = b.slot / Math.max(1, b.level);
      if (ra !== rb) return ra - rb;
      if (a.slot !== b.slot) return a.slot - b.slot;
      return b.level - a.level;
    });
  }
  return map;
};

// slots配列（例: [3,2,1]）に jewel.slot を詰められるか
const tryPlaceIntoSlots = (slots, needSize) => {
  let best = -1;
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] >= needSize) {
      if (best === -1 || slots[i] < slots[best]) best = i;
    }
  }
  if (best === -1) return false;
  slots.splice(best, 1);
  return true;
};

// 残りスロットで「新規に付けられるスキル種類数（幅）」を概算
// 各スキルにつき +1 を付けられる最小スロットを1つだけ使う前提で貪欲に最大化
const computeCoverageWidth = (leftoverSlots, decoBySkill) => {
  const needs = [];
  for (const [name, list] of decoBySkill.entries()) {
    const minSlot = Math.min(...list.map((j) => j.slot));
    if (Number.isFinite(minSlot)) needs.push(minSlot);
  }
  needs.sort((a, b) => a - b);
  const slots = [...leftoverSlots].sort((a, b) => a - b);
  let i = 0, j = 0, count = 0;
  while (i < slots.length && j < needs.length) {
    if (slots[i] >= needs[j]) { count++; i++; j++; } else { i++; }
  }
  return count;
};

// ---------- 部位別候補ピックアップ ----------
export const pickArmorCandidates = (selectedSkills, armorCatalog, options = {}) => {
  const { limitPerPart = 6, weight = { skill: 10, series: 6, slot: 0.6 } } = options;

  const names = (selectedSkills || []).map((s) => (typeof s === "string" ? s : s?.name));
  const wanted = new Set(names.filter(Boolean));

  const seriesKeyBySkill = indexSeriesBySkill(armorCatalog);
  const wantedSeriesKeys = new Set(names.map((n) => seriesKeyBySkill.get(n)).filter(Boolean));

  const scorePiece = (p) => {
    let score = 0;
    (p.skills || []).forEach((sk) => { if (wanted.has(sk.name)) score += weight.skill * (sk.level || 1); });
    if (p.seriesKey && wantedSeriesKeys.has(p.seriesKey)) score += weight.series;
    const slotSum = (p.slots || []).reduce((a, b) => a + (b || 0), 0);
    score += slotSum * weight.slot;
    return score;
  };

  const parts = ["head", "chest", "arms", "waist", "legs"];
  const byPart = Object.fromEntries(parts.map((k) => [k, []]));

  (armorCatalog.armor || []).forEach((p) => {
    if (!byPart[p.part]) return;
    byPart[p.part].push({ ...p, _score: scorePiece(p) });
  });

  parts.forEach((k) => {
    byPart[k].sort((a, b) => b._score - a._score);
    byPart[k] = byPart[k].slice(0, limitPerPart);
  });

  return byPart;
};

// ---------- 5部位セット自動探索（装飾品＋護石で補完） ----------
export const computeTopSets = (
  selectedSkills,
  armorCatalog,
  decorationsCatalog,
  talismansCatalog,
  options = {}
) => {
  const { kPerPart = 6, topN = 20, includeWeaponSlots = [] } = options;

  const required = toRequiredMap(selectedSkills);
  const seriesKeyBySkill = indexSeriesBySkill(armorCatalog);
  const seriesThresholds = indexSeriesThresholds(armorCatalog);
  const decoBySkill = indexDecorationsBySkill(decorationsCatalog);

  // シリーズ要求（例: 海竜の渦雷 Lv1 → 2部位、Lv2 → 4部位）
  const requiredSeriesPieces = new Map(); // seriesKey -> minPieces
  for (const [skillName, lv] of required) {
    const sKey = seriesKeyBySkill.get(skillName);
    if (!sKey) continue;
    const th = seriesThresholds.get(sKey) || [2];
    const idx = Math.min(Math.max(1, lv) - 1, th.length - 1);
    requiredSeriesPieces.set(sKey, th[idx]);
  }

  // 部位別候補（枝刈り）
  const byPart = pickArmorCandidates(selectedSkills, armorCatalog, { limitPerPart: kPerPart });
  const parts = ["head", "chest", "arms", "waist", "legs"];

  // 護石候補（在庫があればそれ、なければ null 1件）
  const talismanList = talismansCatalog?.talismans || talismansCatalog?.inventory || [];
  const talismanCandidates = talismanList.length ? talismanList : [null];

  const results = [];

  // スキル合算
  const addSkills = (map, skills = []) => {
    const out = new Map(map);
    skills.forEach((sk) => out.set(sk.name, (out.get(sk.name) || 0) + (sk.level || 1)));
    return out;
  };

  const tryFillWithDecos = (missingMap, slotsArr) => {
    const slots = [...slotsArr].sort((a, b) => b - a);
    const used = [];
    for (const [name, needLv] of missingMap) {
      let rest = needLv;
      const decos = decoBySkill.get(name) || [];
      let i = 0;
      while (rest > 0 && i < decos.length) {
        const j = decos[i];
        if (tryPlaceIntoSlots(slots, j.slot)) {
          used.push({ key: j.key, name: j.name, slot: j.slot, skill: name, add: j.level });
          rest -= j.level;
        } else {
          i++;
        }
      }
      if (rest > 0) return { ok: false };
    }
    return { ok: true, used, leftoverSlots: slots };
  };

  // 探索本体
  byPart.head.forEach((H) => {
    byPart.chest.forEach((C) => {
      byPart.arms.forEach((A) => {
        byPart.waist.forEach((W) => {
          byPart.legs.forEach((L) => {
            const pieces = [H, C, A, W, L];
            const pieceSkills = pieces.flatMap((p) => p.skills || []);
            const skillsMap = addSkills(new Map(), pieceSkills);
            const seriesCount = new Map();
            pieces.forEach((p) => { if (p.seriesKey) seriesCount.set(p.seriesKey, (seriesCount.get(p.seriesKey) || 0) + 1); });

            // シリーズ条件達成判定（未達は枝刈り）
            for (const [sKey, need] of requiredSeriesPieces) {
              if ((seriesCount.get(sKey) || 0) < need) return;
            }

            // 通常スキルの不足
            const missing = new Map();
            for (const [name, reqLv] of required) {
              if (seriesKeyBySkill.has(name)) continue;
              const got = skillsMap.get(name) || 0;
              if (got < reqLv) missing.set(name, reqLv - got);
            }

            const slotsFromArmor = pieces.flatMap((p) => p.slots || []);
            const baseSlots = [...slotsFromArmor, ...includeWeaponSlots];
            const totalSlot = baseSlots.length ? sum(baseSlots) : 0;

            talismanCandidates.forEach((T) => {
              const tSkills = T?.skills || [];
              const tSlots = T?.slots || [];

              // 護石スキル分で不足軽減
              const afterT = new Map(missing);
              tSkills.forEach((sk) => {
                const need = afterT.get(sk.name) || 0;
                if (need > 0) {
                  afterT.set(sk.name, Math.max(0, need - (sk.level || 1)));
                  if (afterT.get(sk.name) === 0) afterT.delete(sk.name);
                }
              });

              // 装飾品で埋める
              const fill = tryFillWithDecos(afterT, [...baseSlots, ...tSlots]);
              if (!fill.ok) return;

              // 充足率
              let reqSum = 0, haveSum = 0;
              for (const [name, reqLv] of required) {
                if (seriesKeyBySkill.has(name)) { reqSum += 1; haveSum += 1; }
                else {
                  reqSum += reqLv;
                  const got = (skillsMap.get(name) || 0) + (tSkills.find((s) => s.name === name)?.level || 0);
                  const addFromDeco = fill.used.filter((u) => u.skill === name).reduce((a, b) => a + (b.add || 0), 0);
                  haveSum += Math.min(reqLv, got + addFromDeco);
                }
              }
              const satisfiedRatio = reqSum ? haveSum / reqSum : 1;

              // 「幅」＝残スロで新規に盛れるスキル種類数（概算）
              const coverageWidth = computeCoverageWidth(fill.leftoverSlots, decoBySkill);

              results.push({
                coverageWidth,
                satisfiedRatio,
                leftoverSlots: fill.leftoverSlots,
                pieces: { head: H, chest: C, arms: A, waist: W, legs: L },
                talisman: T ? { name: T.name, slots: T.slots, skills: T.skills } : null,
                decorations: fill.used,
              });
            });
          });
        });
      });
    });
  });

  // 並び順：幅 ↓、満たし度 ↓、残スロ合計 ↓
  results.sort((a, b) => {
    if (b.coverageWidth !== a.coverageWidth) return b.coverageWidth - a.coverageWidth;
    if (b.satisfiedRatio !== a.satisfiedRatio) return b.satisfiedRatio - a.satisfiedRatio;
    const sa = (a.leftoverSlots || []).reduce((p, c) => p + c, 0);
    const sb = (b.leftoverSlots || []).reduce((p, c) => p + c, 0);
    return sb - sa;
  });

  return results.slice(0, options.topN || 20);
};
