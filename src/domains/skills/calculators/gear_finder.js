// 厳密シリーズ判定 + 装飾/護石の正規化 + セット無しなら空返却
const norm = (s) =>
  String(s || "").normalize("NFKC").replace(/[・\s　()（）]/g, "").toLowerCase();

// ===== 追加: グループスキルトークン（ヌシの魂）ユーティリティ =====
const _normJP = (s) => norm(s);
const getGroupTokensFromPiece = (piece) => {
  if (!piece || !piece.groupSkill) return [];
  const g = piece.groupSkill;
  if (typeof g === "string") return [_normJP(g)];
  if (Array.isArray(g)) return g.filter(Boolean).map(_normJP);
  return Object.values(g).filter(Boolean).map(_normJP); // {alpha:"",beta:"",gamma:""} 等
};
const countGroupTokenOnPieces = (pieces, tokenJP) => {
  const want = _normJP(tokenJP);
  let cnt = 0;
  for (const p of pieces) {
    const toks = getGroupTokensFromPiece(p);
    if (toks.includes(want)) cnt++;
  }
  return cnt;
};

// 選択スキルから「ヌシの魂」必須を有効化
const GROUP_TOKEN_RULES_MASTER = [
  { names: ["歴戦王ヌシ", "ヌシの魂"], token: "ヌシの魂", threshold: 3 },
];
const pickActiveGroupTokenRules = (selectedSkills) => {
  const names = selectedSkills
    .map((s) => (typeof s === "string" ? s : s?.name))
    .filter(Boolean);
  const nset = new Set(names.map((n) => norm(n)));
  const act = [];
  for (const rule of GROUP_TOKEN_RULES_MASTER) {
    for (const nm of rule.names) {
      if (nset.has(norm(nm))) {
        act.push(rule);
        break;
      }
    }
  }
  return act;
};

// ===== 装飾品 正規化 =====
const normalizeDecorations = (decoCatalog) => {
  const raw = decoCatalog?.decorations || [];
  return raw
    .map((d) => ({
      key: d.key || d.id || d.name,
      name: d.name || "",
      slot: Number(d.slot ?? 1) || 1,
      skills: (Array.isArray(d.skills) ? d.skills : []).map((sk) => ({
        name: sk.name,
        level: Number(sk.level ?? 1) || 1,
      })),
    }))
    .filter((x) => x.name && x.slot > 0 && x.skills?.length);
};

// ===== 護石 正規化（craftable を優先。鑑定はBAN可）=====
const BAN_APPRAISAL = true;
const buildTalismanCandidates = (
  tCatalog,
  requiredMap,
  { banAppraisal = BAN_APPRAISAL } = {}
) => {
  const list = [];

  // 実在庫（例）… 鑑定護石は一旦禁止
  if (!banAppraisal) {
    const ex = tCatalog?.appraised?.exampleInventory || [];
    for (const t of ex) {
      list.push({
        name: t.name || "鑑定護石",
        slots: Array.isArray(t.slots)
          ? t.slots.map((n) => Number(n) || 0).filter(Boolean)
          : [],
        skills: (t.skills || []).map((sk) => ({
          name: sk.name,
          level: Number(sk.level || 1) || 1,
        })),
      });
    }
  }

  // 作成可能（指定スキルの Lv1..min(max, required) を候補化 / スロは無し）
  const craft = tCatalog?.craftable || [];
  for (const c of craft) {
    const sk = c.skill;
    if (!sk?.name) continue;
    const req = requiredMap.get(sk.name);
    if (!req) continue; // 要求されてないスキルは候補爆発を防ぐためスキップ
    const upto = Math.min(Number(sk.maxLevel || 1), req);
    for (let lv = 1; lv <= upto; lv++) {
      list.push({
        name: `${c.name} Lv${lv}`,
        slots: [],
        skills: [{ name: sk.name, level: lv }],
      });
    }
  }

  return list.length ? list : [null]; // 0件なら null 1件で探索は継続
};

// ===== 系列（シリーズ）逆引き =====
const getSeriesKeyOfPiece = (p) =>
  p?.seriesKey ?? p?.series ?? p?.setKey ?? p?.series_key ?? null;
const indexSeriesBySkill = (armorCatalog) => {
  const m = new Map();
  (armorCatalog?.series || []).forEach((s) => {
    const key = s?.key;
    const nm = s?.seriesSkill?.name;
    if (key && nm) m.set(norm(nm), key);
    const ths = s?.seriesSkill?.thresholds;
    if (key && Array.isArray(ths))
      ths.forEach((t) => t?.name && m.set(norm(t.name), key));
  });
  return m;
};
const indexSeriesThresholds = (armorCatalog) => {
  const m = new Map();
  (armorCatalog?.series || []).forEach((s) => {
    const th =
      s?.seriesSkill?.thresholds || s?.thresholds || s?.seriesSkill?.pieces || [2];
    const arr = Array.isArray(th) ? th : [th];
    const counts = arr
      .map((x) => (typeof x === "number" ? x : x?.count))
      .filter((n) => Number.isFinite(n));
    m.set(s.key, counts.length ? counts : [2]);
  });
  return m;
};

// ===== 残スロに珠を詰める・幅算出 =====
const tryPlaceIntoSlots = (slots, needSize) => {
  let best = -1;
  for (let i = 0; i < slots.length; i++)
    if (slots[i] >= needSize)
      if (best === -1 || slots[i] < slots[best]) best = i;
  if (best === -1) return false;
  slots.splice(best, 1);
  return true;
};
const indexDecorationsBySkill = (decorations) => {
  const map = new Map();
  decorations.forEach((d) =>
    (d.skills || []).forEach((sk) => {
      const list = map.get(sk.name) || [];
      list.push({ key: d.key, name: d.name, slot: d.slot, level: sk.level || 1 });
      map.set(sk.name, list);
    })
  );
  for (const [k, list] of map)
    list.sort((a, b) => {
      const ra = a.slot / Math.max(1, a.level),
        rb = b.slot / Math.max(1, b.level);
      if (ra !== rb) return ra - rb;
      if (a.slot !== b.slot) return a.slot - b.slot;
      return b.level - a.level;
    });
  return map;
};
const computeCoverageWidth = (leftoverSlots, decoBySkill) => {
  const needs = [];
  for (const [, list] of decoBySkill) {
    const m = Math.min(...list.map((j) => j.slot));
    if (Number.isFinite(m)) needs.push(m);
  }
  needs.sort((a, b) => a - b);
  const slots = [...leftoverSlots].sort((a, b) => a - b);
  let i = 0,
    j = 0,
    c = 0;
  while (i < slots.length && j < needs.length) {
    if (slots[i] >= needs[j]) {
      c++;
      i++;
      j++;
    } else i++;
  }
  return c;
};

// ===== パーツ候補 =====
export const pickArmorCandidates = (
  selectedSkills,
  armorCatalog,
  { limitPerPart = 6, weight = { skill: 10, series: 6, slot: 0.6 } } = {}
) => {
  if (!selectedSkills?.length)
    return { head: [], chest: [], arms: [], waist: [], legs: [] };

  const names = selectedSkills
    .map((s) => (typeof s === "string" ? s : s?.name))
    .filter(Boolean);
  const wanted = new Set(names);
  const seriesKeyBySkill = indexSeriesBySkill(armorCatalog);
  const wantedSeriesKeys = new Set(
    names.map((n) => seriesKeyBySkill.get(norm(n))).filter(Boolean)
  );

  const score = (p) => {
    let sc = 0;
    (p.skills || []).forEach((sk) => {
      if (wanted.has(sk.name)) sc += weight.skill * (sk.level || 1);
    });
    const sKey = getSeriesKeyOfPiece(p);
    if (sKey && wantedSeriesKeys.has(sKey)) sc += weight.series;
    const slotSum = (p.slots || []).reduce((a, b) => a + (b || 0), 0);
    sc += slotSum * weight.slot;
    return sc;
  };

  const parts = ["head", "chest", "arms", "waist", "legs"];
  const byPart = Object.fromEntries(parts.map((k) => [k, []]));
  (armorCatalog.armor || []).forEach((p) => {
    if (byPart[p.part]) byPart[p.part].push({ ...p, _score: score(p) });
  });
  parts.forEach((k) => {
    byPart[k].sort((a, b) => b._score - a._score);
    byPart[k] = byPart[k].slice(0, limitPerPart);
  });
  return byPart;
};

// ===== 5部位セット探索 =====
export const computeTopSets = (
  selectedSkills,
  armorCatalog,
  decorationsCatalog,
  talismansCatalog,
  options = {}
) => {
  if (!selectedSkills?.length) return [];

  const { kPerPart = 6, topN = 20, includeWeaponSlots = [] } = options;

  // 必要スキル表
  const required = new Map();
  selectedSkills.forEach((s) => {
    const name = typeof s === "string" ? s : s?.name;
    const lv = typeof s === "string" ? 1 : s?.requiredLevel ?? s?.level ?? s?.lv ?? 1;
    if (name) required.set(name, Math.max(lv, required.get(name) || 0));
  });

  // 追加: グループトークン必須を抽出（例：歴戦王ヌシ/ヌシの魂）
  const activeGroupRules = pickActiveGroupTokenRules(selectedSkills);
  // グループ名は通常スキル要件から除外（デコで埋める対象にしない）
  activeGroupRules.forEach((r) => r.names.forEach((nm) => required.delete(nm)));

  const decorations = normalizeDecorations(decorationsCatalog);
  const decoBySkill = indexDecorationsBySkill(decorations);
  const seriesKeyBySkill = indexSeriesBySkill(armorCatalog);
  const seriesThresholds = indexSeriesThresholds(armorCatalog);
  const requiredSeriesPieces = new Map();
  for (const [nm, lv] of required) {
    const sKey = seriesKeyBySkill.get(norm(nm));
    if (!sKey) continue;
    const th = seriesThresholds.get(sKey) || [2];
    const idx = Math.min(Math.max(1, lv) - 1, th.length - 1);
    requiredSeriesPieces.set(sKey, th[idx]);
  }

  const byPart = pickArmorCandidates(selectedSkills, armorCatalog, {
    limitPerPart: kPerPart,
  });

  const talismanCandidates = buildTalismanCandidates(talismansCatalog, required, {
    banAppraisal: true, // ★ 鑑定護石を除外
  });

  const addSkills = (map, skills = []) => {
    const out = new Map(map);
    skills.forEach((sk) =>
      out.set(sk.name, (out.get(sk.name) || 0) + (sk.level || 1))
    );
    return out;
  };

  const results = [];
  const tryFillWithDecos = (missingMap, slotsArr) => {
    const slots = [...slotsArr].sort((a, b) => b - a);
    const used = [];
    for (const [name, needLv] of missingMap) {
      let rest = needLv;
      const list = decoBySkill.get(name) || [];
      let i = 0;
      while (rest > 0 && i < list.length) {
        const j = list[i];
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

  byPart.head.forEach((H) => {
    byPart.chest.forEach((C) => {
      byPart.arms.forEach((A) => {
        byPart.waist.forEach((W) => {
          byPart.legs.forEach((L) => {
            const pcs = [H, C, A, W, L];
            const skillsMap = addSkills(new Map(), pcs.flatMap((p) => p.skills || []));
            const seriesCount = new Map();
            pcs.forEach((p) => {
              const k = getSeriesKeyOfPiece(p);
              if (k) seriesCount.set(k, (seriesCount.get(k) || 0) + 1);
            });

            // --- シリーズ条件：満たさなければ棄却 ---
            for (const [k, need] of requiredSeriesPieces) {
              if ((seriesCount.get(k) || 0) < need) return;
            }

            // --- 追加: グループトークン（例：ヌシの魂）条件 ---
            if (activeGroupRules.length) {
              for (const rule of activeGroupRules) {
                const cnt = countGroupTokenOnPieces(pcs, rule.token);
                if (cnt < rule.threshold) return; // この組合せは不採用
              }
            }

            // --- 通常スキルの不足 ---
            const missing = new Map();
            for (const [name, reqLv] of required) {
              if (seriesKeyBySkill.has(norm(name))) continue;
              const got = skillsMap.get(name) || 0;
              if (got < reqLv) missing.set(name, reqLv - got);
            }

            const baseSlots = pcs
              .flatMap((p) => p.slots || [])
              .concat(includeWeaponSlots || []);

            talismanCandidates.forEach((T) => {
              const tSlots = T?.slots || [];
              const tSkills = T?.skills || [];

              const afterT = new Map(missing);
              tSkills.forEach((sk) => {
                const need = afterT.get(sk.name) || 0;
                if (need > 0) {
                  const left = Math.max(0, need - (sk.level || 1));
                  if (left === 0) afterT.delete(sk.name);
                  else afterT.set(sk.name, left);
                }
              });

              const fill = tryFillWithDecos(afterT, baseSlots.concat(tSlots));
              if (!fill.ok) return;

              // 満たし度（シリーズは満たしている前提）
              let reqSum = 0,
                haveSum = 0;
              for (const [name, reqLv] of required) {
                if (seriesKeyBySkill.has(norm(name))) {
                  reqSum += 1;
                  haveSum += 1;
                } else {
                  reqSum += reqLv;
                  const got =
                    (skillsMap.get(name) || 0) +
                    (tSkills.find((s) => s.name === name)?.level || 0);
                  const add = fill.used
                    .filter((u) => u.skill === name)
                    .reduce((a, b) => a + (b.add || 0), 0);
                  haveSum += Math.min(reqLv, got + add);
                }
              }

              const coverageWidth = computeCoverageWidth(
                fill.leftoverSlots,
                decoBySkill
              );

              results.push({
                coverageWidth,
                satisfiedRatio: reqSum ? haveSum / reqSum : 1,
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

  results.sort((a, b) => {
    if (b.coverageWidth !== a.coverageWidth) return b.coverageWidth - a.coverageWidth;
    if (b.satisfiedRatio !== a.satisfiedRatio)
      return b.satisfiedRatio - a.satisfiedRatio;
    const sa = (a.leftoverSlots || []).reduce((p, c) => p + c, 0),
      sb = (b.leftoverSlots || []).reduce((p, c) => p + c, 0);
    return sb - sa;
  });

  return results.slice(0, topN);
};
