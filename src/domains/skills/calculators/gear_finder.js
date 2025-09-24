// gear_finder.js — Hybrid: UI helpers from legacy, search = strict-minimal (series/group/decoration)
import { weaponSkillsSet as CANON_WEAPON_SKILLS } from "./weapon_skills.canonical.js";

/* ===== helpers (detail & summarizer) ===== */
(function () {
  const _addSkill = (map, name, lv) => {
    if (!name || !lv) return;
    map.set(name, (map.get(name) || 0) + lv);
  };
  if (typeof window !== "undefined") {
    window.summarizeAllSkillsFromResult = function (pieces, talisman, decorations) {
      const m = new Map();
      const parts = [pieces?.head, pieces?.chest, pieces?.arms, pieces?.waist, pieces?.legs];
      parts.forEach(p => (p?.skills || []).forEach(s => _addSkill(m, s.name, s.level || 1)));
      (talisman?.skills || []).forEach(s => _addSkill(m, s.name, s.level || 1));
      (decorations || []).forEach(d => _addSkill(m, d.skill || d.name, d.add || d.level || 1));
      return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'ja')).map(([name, level]) => ({ name, level }));
    };
    window.buildResultDetail = function (H, C, A, W, L, T, usedDecos, activations) {
      const equipLine = [
        `頭 ${H?.name || "-"}`,
        `胴 ${C?.name || "-"}`,
        `腕 ${A?.name || "-"}`,
        `腰 ${W?.name || "-"}`,
        `脚 ${L?.name || "-"}`,
        `護石 ${T?.name || "なし"}`
      ].join(" / ");
      const bySkill = new Map();
      const add = (name, src, lv) => {
        if (!name || !lv) return;
        const row = bySkill.get(name) || { weapon: 0, head: 0, chest: 0, arms: 0, waist: 0, legs: 0, talisman: 0, deco: 0 };
        row[src] += lv;
        bySkill.set(name, row);
      };
      (H?.skills || []).forEach(s => add(s.name, "head", s.level || 1));
      (C?.skills || []).forEach(s => add(s.name, "chest", s.level || 1));
      (A?.skills || []).forEach(s => add(s.name, "arms", s.level || 1));
      (W?.skills || []).forEach(s => add(s.name, "waist", s.level || 1));
      (L?.skills || []).forEach(s => add(s.name, "legs", s.level || 1));
      (T?.skills || []).forEach(s => add(s.name, "talisman", s.level || 1));
      (usedDecos || []).forEach(d => add(d.skill || d.name, "deco", d.add || d.level || 1));
      const perSkill = [...bySkill.entries()].map(([name, r]) => {
        const total = r.weapon + r.head + r.chest + r.arms + r.waist + r.legs + r.talisman + r.deco;
        return { name, ...r, total, label: `${name}Lv${total}` };
      }).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'ja'));
      const decoCounts = new Map();
      (usedDecos || []).forEach(d => {
        const key = d.name || `${d.skill || ""}【${d.slot || ""}】`; decoCounts.set(key, (decoCounts.get(key) || 0) + 1);
      });
      const decoList = [...decoCounts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ja'));

      const serLine = (activations?.series && activations.series.length)
        ? `発動シリーズ：` + activations.series.map(s => `${s.name}（${s.count}/${s.required}：${s.stageName}）`).join(' / ')
        : '';
      const grpLine = (activations?.groups && activations.groups.length)
        ? `発動グループ：` + activations.groups.map(g => `${g.token} ×${g.count}`).join(' / ')
        : '';

      const html = [
        `<div class="result-detail">`,
        `<div class="equip-line">${equipLine}</div>`,
        serLine ? `<div class="activated-line series">${serLine}</div>` : ``,
        grpLine ? `<div class="activated-line groups">${grpLine}</div>` : ``,
        `<table class="skills-table"><thead><tr><th>ポイント</th><th>武器</th><th>頭</th><th>胴</th><th>腕</th><th>腰</th><th>脚</th><th>護石</th><th>装飾品</th><th>合計</th><th>発動スキル</th></tr></thead><tbody>`,
        ...perSkill.map(r => `<tr><td>${r.name}</td><td>${r.weapon || 0}</td><td>${r.head || 0}</td><td>${r.chest || 0}</td><td>${r.arms || 0}</td><td>${r.waist || 0}</td><td>${r.legs || 0}</td><td>${r.talisman || 0}</td><td>${r.deco || 0}</td><td>${r.total}</td><td>${r.label}</td></tr>`),
        `</tbody></table>`,
        decoList.length ? `<div class="deco-line">装飾品 ${decoList.map(d => `${d.name} ×${d.count}`).join(' / ')}</div>` : ``,
        `</div>`
      ].join("");
      return { equipLine, perSkill, decoList, activations, html };
    };
  } else {
    globalThis.summarizeAllSkillsFromResult = function () { return []; };
    globalThis.buildResultDetail = function () { return { equipLine: '', perSkill: [], decoList: [], activations: null, html: '' }; };
  }
})();

/* ===== utilities ===== */
const norm = (s) => String(s || "").normalize("NFKC").replace(/[・\s　()（）\[\]【】]/g, "").toLowerCase();
const _variantKey = (v) => { const s = String(v || "").trim(); if (s === "α" || /alpha/i.test(s)) return "alpha"; if (s === "β" || /beta/i.test(s)) return "beta"; if (s === "γ" || /gamma/i.test(s)) return "gamma"; return s.toLowerCase(); };
const getSeriesKeyOfPiece = (p) => p?.seriesKey ?? p?.series ?? p?.setKey ?? p?.series_key ?? null;

/* ===== series/group indices ===== */
const buildGroupTokenIndices = (armorCatalog) => {
  const tokens = new Set();
  (armorCatalog?.series || []).forEach((s) => {
    const gs = s?.groupSkill; if (!gs) return;
    Object.values(gs).forEach((v) => v && tokens.add(String(v)));
  });
  const canonicalByName = new Map(); tokens.forEach((n) => canonicalByName.set(norm(n), n));
  const tokenBySeriesVariant = new Map();
  (armorCatalog?.series || []).forEach((s) => {
    const gs = s?.groupSkill; if (!gs) return;
    const rec = {}; Object.entries(gs).forEach(([k, v]) => { if (!v) return; const canon = canonicalByName.get(norm(v)) || v; rec[_variantKey(k)] = canon; });
    if (s?.key && Object.keys(rec).length) tokenBySeriesVariant.set(s.key, rec);
  });
  return { canonicalByName, tokenBySeriesVariant };
};
const pickActiveGroupTokenRules = (selectedSkills, canonicalByName) => {
  const names = (selectedSkills || []).map((s) => (typeof s === "string" ? s : s?.name)).filter(Boolean);
  const rulesMap = new Map();
  names.forEach((n) => {
    const canon = canonicalByName.get(norm(n)); if (!canon) return;
    if (!rulesMap.has(canon)) rulesMap.set(canon, { token: canon, threshold: 3, names: new Set() });
    rulesMap.get(canon).names.add(n);
  });
  return [...rulesMap.values()].map((r) => ({ token: r.token, threshold: r.threshold, names: [...r.names] }));
};
const indexSeriesKeysBySeriesSkill = (armorCatalog) => {
  const m = new Map();
  const add = (nm, key) => { const k = norm(nm); if (!k || !key) return; if (!m.has(k)) m.set(k, new Set()); m.get(k).add(key); };
  (armorCatalog?.series || []).forEach((s) => {
    const key = s?.key, nm = s?.seriesSkill?.name; if (key && nm) add(nm, key);
    const ths = s?.seriesSkill?.thresholds; if (key && Array.isArray(ths)) ths.forEach((t) => t?.name && add(t.name, key));
  });
  return m;
};
const indexSeriesThresholds = (armorCatalog) => {
  const m = new Map();
  (armorCatalog?.series || []).forEach((s) => {
    const ths = Array.isArray(s?.seriesSkill?.thresholds) ? s.seriesSkill.thresholds : [];
    const arr = ths.map((t) => Number(t?.count || 0)).filter(n => n > 0);
    m.set(s.key, arr.length ? arr : [2]);
  });
  return m;
};
const indexSeriesThresholdNames = (armorCatalog) => {
  const m = new Map();
  (armorCatalog?.series || []).forEach((s) => {
    const ths = Array.isArray(s?.seriesSkill?.thresholds) ? s.seriesSkill.thresholds : [];
    m.set(s.key, ths.map(t => ({ count: Number(t?.count || 0) || 0, name: t?.name || "" })));
  });
  return m;
};
const indexSeriesMap = (armorCatalog) => {
  const m = new Map(); (armorCatalog?.series || []).forEach((s) => m.set(s.key, s)); return m;
};

/* ===== decorations (minimal) ===== */
const normalizeDecorations = (decoCatalog) => {
  const raw = decoCatalog?.decorations || [];
  return raw.map((d) => ({
    key: d.key || d.id || d.name,
    name: d.name || "",
    slot: Number(d.slot ?? 1) || 1,
    skills: (Array.isArray(d.skills) ? d.skills : []).map((sk) => ({ name: sk.name, level: Number(sk.level ?? 1) || 1 })),
  })).filter(x => x.name && x.slot > 0 && x.skills?.length);
};
const indexDecorationsBySkill = (decorations) => {
  const map = new Map();
  decorations.forEach((d) => (d.skills || []).forEach((sk) => {
    const list = map.get(sk.name) || [];
    list.push({ key: d.key, name: d.name, slot: d.slot, level: sk.level || 1 });
    map.set(sk.name, list);
  }));
  for (const [k, list] of map) list.sort((a, b) => (a.slot - b.slot) || (b.level - a.level));
  return map;
};
const tryPlaceIntoSlots = (slots, need) => {
  let idx = -1, best = Infinity;
  for (let i = 0; i < slots.length; i++) if (slots[i] >= need && slots[i] < best) { best = slots[i]; idx = i; }
  if (idx === -1) return false;
  slots.splice(idx, 1);
  return true;
};

/* ===== talismans ===== */
const buildTalismanCandidates = (talismansCatalog, requiredMap, { includeAppraised = false } = {}) => {
  const list = [{ name: null, slots: [], skills: [] }];
  const craft = talismansCatalog?.craftable || [];
  for (const c of craft) {
    const sk = c.skill;
    if (!sk?.name) continue;
    const req = requiredMap.get(sk.name);
    if (!req) continue;
    const upto = Math.min(Number(sk.maxLevel || 1), req);
    for (let lv = 1; lv <= upto; lv++) {
      list.push({ name: `${c.name} Lv${lv}`, slots: [], skills: [{ name: sk.name, level: lv }] });
    }
  }
  if (includeAppraised) {
    const ex = talismansCatalog?.appraised?.exampleInventory || [];
    for (const t of ex) {
      list.push({
        name: t.name || "鑑定護石",
        slots: Array.isArray(t.slots) ? t.slots.map(n => Number(n) || 0).filter(Boolean) : [],
        skills: (t.skills || []).map(sk => ({ name: sk.name, level: Number(sk.level || 1) || 1 })),
      });
    }
  }
  return list;
};

/* ===== activations for display ===== */
const summarizeActivations = (pcs, armorCatalog) => {
  const list = [pcs.head, pcs.chest, pcs.arms, pcs.waist, pcs.legs].filter(Boolean);
  // Series
  const seriesMap = indexSeriesMap(armorCatalog);
  const thNames = indexSeriesThresholdNames(armorCatalog);
  const countByKey = new Map();
  list.forEach(p => { const k = getSeriesKeyOfPiece(p); if (k) countByKey.set(k, (countByKey.get(k) || 0) + 1); });
  const seriesActivated = [];
  for (const [key, cnt] of countByKey) {
    const s = seriesMap.get(key); if (!s) continue;
    const ths = thNames.get(key) || [];
    let stage = null;
    for (const t of ths) if (t.count && t.count <= cnt) stage = t;
    if (stage) {
      const maxNeed = Math.max(...ths.map(t => t.count || 0).filter(n => n > 0));
      seriesActivated.push({ key, name: s.seriesSkill?.name || s.seriesName || s.key, count: cnt, required: maxNeed || 2, stageName: stage.name || "" });
    }
  }
  // Groups (threshold=3)
  const { tokenBySeriesVariant } = buildGroupTokenIndices(armorCatalog);
  const countByToken = new Map();
  list.forEach(p => {
    const key = getSeriesKeyOfPiece(p); if (!key) return;
    const rec = tokenBySeriesVariant.get(key); if (!rec) return;
    const tok = rec[_variantKey(p?.variant)]; if (!tok) return;
    countByToken.set(tok, (countByToken.get(tok) || 0) + 1);
  });
  const groupsActivated = [];
  for (const [tok, cnt] of countByToken) if (cnt >= 3) groupsActivated.push({ token: tok, count: cnt, threshold: 3 });
  return { series: seriesActivated.sort((a, b) => a.name.localeCompare(b.name, 'ja')), groups: groupsActivated.sort((a, b) => b.count - a.count || a.token.localeCompare(b.token, 'ja')) };
};

/* ===== candidates (pruning) ===== */


export const pickArmorCandidates = (selectedSkills, armorCatalog, { limitPerPart = 12 } = {}) => {
  if (!selectedSkills?.length) return { head: [], chest: [], arms: [], waist: [], legs: [] };

  // classify wanted
  const seriesKeysBySkill = indexSeriesKeysBySeriesSkill(armorCatalog);
  const names = selectedSkills.map(s => typeof s === "string" ? s : s?.name).filter(Boolean);
  const wantedNormal = new Set();
  const wantedSeriesKeys = new Set();
  for (const name of names) {
    const keys = seriesKeysBySkill.get(norm(name));
    if (keys && keys.size) keys.forEach(k => wantedSeriesKeys.add(k));
    else wantedNormal.add(name);
  }

  const parts = ["head", "chest", "arms", "waist", "legs"];
  const byPart = Object.fromEntries(parts.map(k => [k, []]));
  const rel = (p) => {
    if (!p) return false;
    const sKey = getSeriesKeyOfPiece(p);
    if (sKey && wantedSeriesKeys.has(sKey)) return true;
    if ((p.skills || []).some(sk => wantedNormal.has(sk.name))) return true;
    return false;
  };
  const slotSum = (p) => (p.slots || []).reduce((a, b) => a + (b || 0), 0);

  (armorCatalog.armor || []).forEach(p => { if (byPart[p.part]) byPart[p.part].push(p); });

  for (const k of parts) {
    const arr = byPart[k];
    const relevant = arr.filter(rel).sort((a, b) => slotSum(b) - slotSum(a));
    const rest = arr.filter(p => !rel(p)).sort((a, b) => slotSum(b) - slotSum(a));
    byPart[k] = relevant.concat(rest).slice(0, Math.max(limitPerPart, relevant.length));
  }

  return byPart;
};




// ===== main (strict-minimal) =====
export const computeTopSets = (selectedSkills, armorCatalog, decorationsCatalog, talismansCatalog, options = {}) => {
  if (!selectedSkills?.length) return [];

  const {
    kPerPart = 12,
    topN = 20,
    includeWeaponSlots = [],
    allowAppraisedTalismans = false,
  } = options;

  // requirements
  const required = new Map();
  selectedSkills.forEach((s) => {
    const name = typeof s === "string" ? s : s?.name;
    const lv = typeof s === "string" ? 1 : s?.requiredLevel ?? s?.level ?? s?.lv ?? 1;
    if (name) required.set(name, Math.max(lv, required.get(name) || 0));
  });

  // series/group prep
  const seriesKeysBySkill = indexSeriesKeysBySeriesSkill(armorCatalog);
  const seriesThresholds = indexSeriesThresholds(armorCatalog);
  const { canonicalByName, tokenBySeriesVariant: groupIndex } = buildGroupTokenIndices(armorCatalog);
  const activeGroupRules = pickActiveGroupTokenRules(selectedSkills, canonicalByName);
  activeGroupRules.forEach(r => r.names.forEach(nm => required.delete(nm)));

  const requiredSeriesGroups = [];
  for (const [nm, lv] of required) {
    const keysSet = seriesKeysBySkill.get(norm(nm)); if (!keysSet || !keysSet.size) continue;
    const keys = [...keysSet];
    const idx = Math.max(1, lv) - 1;
    const need = Math.min(...keys.map(k => {
      const th = seriesThresholds.get(k) || [2];
      const i = Math.min(idx, th.length - 1);
      return th[i];
    }));
    requiredSeriesGroups.push({ name: nm, keys, need });
  }
  requiredSeriesGroups.forEach(g => required.delete(g.name));

  // decorations
  const decorations = normalizeDecorations(decorationsCatalog);
  const decoBySkill = indexDecorationsBySkill(decorations);

  // candidates including "-"(null)
  const baseByPart = pickArmorCandidates(selectedSkills, armorCatalog, { limitPerPart: kPerPart });
  const parts = ["head", "chest", "arms", "waist", "legs"];
  const withNull = (part, arr) => [{ part, name: null, slots: [], skills: [], seriesKey: null }, ...(arr || [])];
  const lists = { head: withNull("head", baseByPart.head), chest: withNull("chest", baseByPart.chest), arms: withNull("arms", baseByPart.arms), waist: withNull("waist", baseByPart.waist), legs: withNull("legs", baseByPart.legs) };

  // talismans
  const talismanCandidates = buildTalismanCandidates(talismansCatalog, required, { includeAppraised: allowAppraisedTalismans });

  const tryPlace = (missingMap, slotsArr) => {
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
        } else i++;
      }
      if (rest > 0) return { ok: false };
    }
    return { ok: true, used, leftoverSlots: slots };
  };

  // search by minimal equip count
  const results = [];
  const seriesMap = indexSeriesMap(armorCatalog);
  const thNames = indexSeriesThresholdNames(armorCatalog);

  const buildAct = (piecesObj) => {
    const list = [piecesObj.head, piecesObj.chest, piecesObj.arms, piecesObj.waist, piecesObj.legs].filter(Boolean);
    const seriesCount = new Map();
    list.forEach(p => { const k = getSeriesKeyOfPiece(p); if (k) seriesCount.set(k, (seriesCount.get(k) || 0) + 1); });
    // series display
    const ser = [];
    for (const [key, cnt] of seriesCount) {
      const s = seriesMap.get(key); if (!s) continue;
      const ths = thNames.get(key) || []; let stage = null;
      for (const t of ths) if (t.count && t.count <= cnt) stage = t;
      if (stage) { const maxNeed = Math.max(...ths.map(t => t.count || 0).filter(n => n > 0)); ser.push({ key, name: s.seriesSkill?.name || s.seriesName || s.key, count: cnt, required: maxNeed || 2, stageName: stage.name || "" }); }
    }
    // groups
    const groups = [];
    const countByTok = new Map();
    list.forEach(p => { const rec = groupIndex.get(getSeriesKeyOfPiece(p)); if (!rec) return; const tok = rec[_variantKey(p?.variant)]; if (!tok) return; countByTok.set(tok, (countByTok.get(tok) || 0) + 1); });
    for (const [tok, cnt] of countByTok) if (cnt >= 3) groups.push({ token: tok, count: cnt, threshold: 3 });
    return { series: ser.sort((a, b) => a.name.localeCompare(b.name, 'ja')), groups: groups.sort((a, b) => b.count - a.count || a.token.localeCompare(b.token, 'ja')) };
  };

  for (let k = 0; k <= 5; k++) {
    const res = [];
    for (const H of lists.head)
      for (const C of lists.chest)
        for (const A of lists.arms)
          for (const W of lists.waist)
            for (const L of lists.legs) {
              const eq = (H.name ? 1 : 0) + (C.name ? 1 : 0) + (A.name ? 1 : 0) + (W.name ? 1 : 0) + (L.name ? 1 : 0);
              if (eq !== k) continue;

              // gates
              const pcs = [H, C, A, W, L];
              const seriesCount = new Map();
              pcs.forEach(p => { if (!p?.name) return; const k = getSeriesKeyOfPiece(p); if (k) seriesCount.set(k, (seriesCount.get(k) || 0) + 1); });
              let passSeries = true;
              for (const g of requiredSeriesGroups) {
                const sum = g.keys.reduce((a, key) => a + (seriesCount.get(key) || 0), 0);
                if (sum < g.need) { passSeries = false; break; }
              }
              if (!passSeries) continue;

              let passGroups = true;
              for (const rule of activeGroupRules) {
                let cnt = 0;
                for (const p of pcs) {
                  if (!p?.name) continue;
                  const rec = groupIndex.get(getSeriesKeyOfPiece(p)); const tok = rec ? rec[_variantKey(p?.variant)] : null;
                  if (tok === rule.token) cnt++;
                }
                if (cnt < (rule.threshold || 3)) { passGroups = false; break; }
              }
              if (!passGroups) continue;

              const baseSlots = [...(H.slots || []), ...(C.slots || []), ...(A.slots || []), ...(W.slots || []), ...(L.slots || []), ...(includeWeaponSlots || [])].filter(n => Number.isFinite(n) && n > 0);
              const baseSkills = pcs.flatMap(p => p?.skills || []);
              const baseMap = new Map(); baseSkills.forEach(sk => baseMap.set(sk.name, (baseMap.get(sk.name) || 0) + (sk.level || 1)));

              const missing0 = new Map();
              for (const [nm, reqLv] of required) {
                const have = baseMap.get(nm) || 0;
                if (have < reqLv) missing0.set(nm, reqLv - have);
              }

              for (const T of talismanCandidates) {
                const afterT = new Map(missing0);
                (T?.skills || []).forEach(sk => {
                  const need = afterT.get(sk.name) || 0; if (need <= 0) return;
                  const rest = Math.max(0, need - (sk.level || 1));
                  if (rest === 0) afterT.delete(sk.name); else afterT.set(sk.name, rest);
                });
                const fill = tryPlace(afterT, baseSlots.concat(T?.slots || []));
                if (!fill.ok) continue;

                // compute fields in the legacy-friendly shape
                const piecesObj = { head: H?.name ? H : null, chest: C?.name ? C : null, arms: A?.name ? A : null, waist: W?.name ? W : null, legs: L?.name ? L : null };
                const talismanObj = T?.name ? { name: T.name, slots: T.slots, skills: T.skills } : null;
                const usedDecos = fill.used;
                const act = summarizeActivations(piecesObj, armorCatalog);

                res.push({
                  leftoverSlots: fill.leftoverSlots,
                  pieces: piecesObj,
                  talisman: talismanObj,
                  decorations: usedDecos,
                  activatedSeries: act.series,
                  activatedGroups: act.groups,
                  allSkills: summarizeAllSkillsFromResult(piecesObj, talismanObj, usedDecos),
                  detail: buildResultDetail(piecesObj.head, piecesObj.chest, piecesObj.arms, piecesObj.waist, piecesObj.legs, talismanObj, usedDecos, act),
                });
                if (res.length > topN * 3) break;
              }
              if (res.length > topN * 3) break;
            }
    if (res.length) {
      res.sort((a, b) => {
        const sa = (a.leftoverSlots || []).reduce((p, c) => p + c, 0), sb = (b.leftoverSlots || []).reduce((p, c) => p + c, 0);
        if (sb !== sa) return sb - sa;
        const ea = [a.pieces.head, a.pieces.chest, a.pieces.arms, a.pieces.waist, a.pieces.legs].reduce((s, p, i) => s + (p ? i : 0), 0);
        const eb = [b.pieces.head, b.pieces.chest, b.pieces.arms, b.pieces.waist, b.pieces.legs].reduce((s, p, i) => s + (p ? i : 0), 0);
        return ea - eb;
      });
      results.push(...res.slice(0, topN));
      break; // strict-minimal: stop at first k with results
    }
  }

  return results.slice(0, topN);
};

export default { pickArmorCandidates, computeTopSets };
