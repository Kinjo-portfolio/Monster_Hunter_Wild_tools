
// ===== helpers (detail & summarizer) =====
(function(){
  const _addSkill = (map, name, lv) => {
    if (!name || !lv) return;
    map.set(name, (map.get(name) || 0) + lv);
  };
  if (typeof window !== "undefined") {
    window.summarizeAllSkillsFromResult = function(pieces, talisman, decorations){
      const m = new Map();
      const parts = [pieces?.head, pieces?.chest, pieces?.arms, pieces?.waist, pieces?.legs];
      parts.forEach(p => (p?.skills || []).forEach(s => _addSkill(m, s.name, s.level || 1)));
      (talisman?.skills || []).forEach(s => _addSkill(m, s.name, s.level || 1));
      (decorations || []).forEach(d => _addSkill(m, d.skill || d.name, d.add || d.level || 1));
      return [...m.entries()].sort((a,b) => a[0].localeCompare(b[0], 'ja')).map(([name, level]) => ({ name, level }));
    };
    window.buildResultDetail = function(H, C, A, W, L, T, usedDecos, activations){
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
        const row = bySkill.get(name) || { weapon:0, head:0, chest:0, arms:0, waist:0, legs:0, talisman:0, deco:0 };
        row[src] += lv;
        bySkill.set(name, row);
      };
      (H?.skills||[]).forEach(s=>add(s.name,"head",s.level||1));
      (C?.skills||[]).forEach(s=>add(s.name,"chest",s.level||1));
      (A?.skills||[]).forEach(s=>add(s.name,"arms",s.level||1));
      (W?.skills||[]).forEach(s=>add(s.name,"waist",s.level||1));
      (L?.skills||[]).forEach(s=>add(s.name,"legs",s.level||1));
      (T?.skills||[]).forEach(s=>add(s.name,"talisman",s.level||1));
      (usedDecos||[]).forEach(d=>add(d.skill||d.name,"deco",d.add||d.level||1));
      const perSkill = [...bySkill.entries()].map(([name,r])=>{
        const total = r.weapon + r.head + r.chest + r.arms + r.waist + r.legs + r.talisman + r.deco;
        return { name, ...r, total, label: `${name}Lv${total}` };
      }).sort((a,b)=> b.total - a.total || a.name.localeCompare(b.name,'ja'));
      const decoCounts = new Map();
      (usedDecos||[]).forEach(d=>{
        const key = d.name || `${d.skill||""}【${d.slot||""}】`; decoCounts.set(key, (decoCounts.get(key)||0)+1);
      });
      const decoList = [...decoCounts.entries()].map(([name,count])=>({name,count})).sort((a,b)=> b.count-a.count || a.name.localeCompare(b.name,'ja'));

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
        ...perSkill.map(r=>`<tr><td>${r.name}</td><td>${r.weapon||0}</td><td>${r.head||0}</td><td>${r.chest||0}</td><td>${r.arms||0}</td><td>${r.waist||0}</td><td>${r.legs||0}</td><td>${r.talisman||0}</td><td>${r.deco||0}</td><td>${r.total}</td><td>${r.label}</td></tr>`),
        `</tbody></table>`,
        decoList.length ? `<div class="deco-line">装飾品 ${decoList.map(d=>`${d.name} ×${d.count}`).join(' / ')}</div>` : ``,
        `</div>`
      ].join("");
      return { equipLine, perSkill, decoList, activations, html };
    };
  } else {
    globalThis.summarizeAllSkillsFromResult = function(){ return []; };
    globalThis.buildResultDetail = function(){ return { equipLine:'', perSkill:[], decoList:[], activations:null, html:'' }; };
  }
})();

// ===== utilities =====
const norm = (s) =>
  String(s || "").normalize("NFKC").replace(/[・\s　()（）\[\]【】]/g, "").toLowerCase();
const _variantKey = (v) => {
  const s = String(v || "").trim();
  if (s === "α" || /alpha/i.test(s)) return "alpha";
  if (s === "β" || /beta/i.test(s)) return "beta";
  if (s === "γ" || /gamma/i.test(s)) return "gamma";
  return s.toLowerCase();
};
const getSeriesKeyOfPiece = (p) =>
  p?.seriesKey ?? p?.series ?? p?.setKey ?? p?.series_key ?? null;

// ===== group indices =====
const buildGroupTokenIndices = (armorCatalog) => {
  const tokens = new Set();
  (armorCatalog?.series || []).forEach((s) => {
    const gs = s?.groupSkill;
    if (!gs) return;
    Object.values(gs).forEach((v) => v && tokens.add(String(v)));
  });
  const canonicalByName = new Map();
  tokens.forEach((n) => canonicalByName.set(norm(n), n));
  const tokenBySeriesVariant = new Map();
  (armorCatalog?.series || []).forEach((s) => {
    const gs = s?.groupSkill;
    if (!gs) return;
    const rec = {};
    Object.entries(gs).forEach(([k, v]) => {
      if (!v) return;
      const canon = canonicalByName.get(norm(v)) || v;
      rec[_variantKey(k)] = canon;
    });
    if (s?.key && Object.keys(rec).length) tokenBySeriesVariant.set(s.key, rec);
  });
  return { canonicalByName, tokenBySeriesVariant };
};
const pickActiveGroupTokenRules = (selectedSkills, canonicalByName) => {
  const names = (selectedSkills || [])
    .map((s) => (typeof s === "string" ? s : s?.name))
    .filter(Boolean);
  const rulesMap = new Map();
  names.forEach((n) => {
    const canon = canonicalByName.get(norm(n));
    if (!canon) return;
    if (!rulesMap.has(canon)) rulesMap.set(canon, { token: canon, threshold: 3, names: new Set() });
    rulesMap.get(canon).names.add(n);
  });
  return [...rulesMap.values()].map((r) => ({ token: r.token, threshold: r.threshold, names: [...r.names] }));
};

// ===== series indices =====
const indexSeriesKeysBySeriesSkill = (armorCatalog) => {
  const m = new Map();
  const add = (nm, key) => {
    const k = norm(nm);
    if (!k || !key) return;
    if (!m.has(k)) m.set(k, new Set());
    m.get(k).add(key);
  };
  (armorCatalog?.series || []).forEach((s) => {
    const key = s?.key;
    const nm  = s?.seriesSkill?.name;
    if (key && nm) add(nm, key);
    const ths = s?.seriesSkill?.thresholds;
    if (key && Array.isArray(ths)) ths.forEach((t) => t?.name && add(t.name, key));
  });
  return m;
};
const indexSeriesThresholds  = (armorCatalog) => {
  const m = new Map();
  (armorCatalog?.series || []).forEach((s) => {
    const ths = Array.isArray(s?.seriesSkill?.thresholds) ? s.seriesSkill.thresholds : [];
    const arr = ths.map((t)=> Number(t?.count||0)).filter(n=>n>0);
    m.set(s.key, arr.length ? arr : [2]);
  });
  return m;
};
const indexSeriesThresholdNames = (armorCatalog) => {
  const m = new Map();
  (armorCatalog?.series || []).forEach((s) => {
    const ths = Array.isArray(s?.seriesSkill?.thresholds) ? s.seriesSkill.thresholds : [];
    m.set(s.key, ths.map(t => ({ count: Number(t?.count||0)||0, name: t?.name || "" })));
  });
  return m;
};
const indexSeriesMap = (armorCatalog) => {
  const m = new Map();
  (armorCatalog?.series || []).forEach((s) => m.set(s.key, s));
  return m;
};

// ===== decorations (minimal) =====
const normalizeDecorations = (decoCatalog) => {
  const raw = decoCatalog?.decorations || [];
  return raw.map((d)=> ({
    key: d.key || d.id || d.name,
    name: d.name || "",
    slot: Number(d.slot ?? 1) || 1,
    skills: (Array.isArray(d.skills) ? d.skills : []).map((sk)=>({ name: sk.name, level: Number(sk.level ?? 1)||1 })),
  })).filter(x=>x.name && x.slot>0 && x.skills?.length);
};
const indexDecorationsBySkill = (decorations) => {
  const map = new Map();
  decorations.forEach((d) => (d.skills||[]).forEach((sk)=>{
    const list = map.get(sk.name) || [];
    list.push({ key:d.key, name:d.name, slot:d.slot, level:sk.level||1 });
    map.set(sk.name, list);
  }));
  for (const [k, list] of map) list.sort((a,b)=> (a.slot - b.slot) || (b.level - a.level));
  return map;
};
const tryPlaceIntoSlots = (slots, need) => {
  let idx = -1, best = Infinity;
  for (let i=0;i<slots.length;i++) if (slots[i] >= need && slots[i] < best) { best = slots[i]; idx = i; }
  if (idx === -1) return false;
  slots.splice(idx,1);
  return true;
};

// ===== talismans =====
const buildTalismanCandidates = (talismansCatalog, requiredMap, { includeAppraised=false } = {}) => {
  const list = [];
  const craft = talismansCatalog?.craftable || [];
  for (const c of craft) {
    const sk = c.skill;
    if (!sk?.name) continue;
    const req = requiredMap.get(sk.name);
    if (!req) continue;
    const upto = Math.min(Number(sk.maxLevel || 1), req);
    for (let lv=1; lv<=upto; lv++) {
      list.push({ name: `${c.name} Lv${lv}`, slots: [], skills: [{ name: sk.name, level: lv }] });
    }
  }
  if (includeAppraised) {
    const ex = talismansCatalog?.appraised?.exampleInventory || [];
    for (const t of ex) {
      list.push({
        name: t.name || "鑑定護石",
        slots: Array.isArray(t.slots) ? t.slots.map(n => Number(n)||0).filter(Boolean) : [],
        skills: (t.skills || []).map(sk => ({ name: sk.name, level: Number(sk.level||1)||1 })),
      });
    }
  }
  return list;
};

// ===== activations for display =====
const summarizeActivations = (pcs, armorCatalog) => {
  const parts = pcs;
  const list = [parts.head, parts.chest, parts.arms, parts.waist, parts.legs].filter(Boolean);
  // Series
  const seriesMap = indexSeriesMap(armorCatalog);
  const thNames   = indexSeriesThresholdNames(armorCatalog);
  const countByKey = new Map();
  list.forEach(p => { const k = getSeriesKeyOfPiece(p); if (k) countByKey.set(k, (countByKey.get(k)||0)+1); });
  const seriesActivated = [];
  for (const [key,cnt] of countByKey) {
    const s = seriesMap.get(key); if (!s) continue;
    const ths = thNames.get(key) || [];
    let stage = null;
    for (const t of ths) if (t.count && t.count <= cnt) stage = t;
    if (stage) {
      const maxNeed = Math.max(...ths.map(t=>t.count||0).filter(n=>n>0));
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
    countByToken.set(tok, (countByToken.get(tok)||0)+1);
  });
  const groupsActivated = [];
  for (const [tok,cnt] of countByToken) if (cnt>=3) groupsActivated.push({ token: tok, count: cnt, threshold: 3 });
  return { series: seriesActivated.sort((a,b)=> a.name.localeCompare(b.name,'ja')), groups: groupsActivated.sort((a,b)=> b.count - a.count || a.token.localeCompare(b.token,'ja')) };
};

// ===== candidate builder (series-aware + group-aware) =====
export const pickArmorCandidates = (
  selectedSkills,
  armorCatalog,
  { limitPerPart = 6, weight = { skill: 10, series: 22, slot: 0.6, group: 50 } } = {}
) => {
  if (!selectedSkills?.length)
    return { head: [], chest: [], arms: [], waist: [], legs: [] };

  const names = selectedSkills.map((s)=> (typeof s === "string" ? s : s?.name)).filter(Boolean);
  const wanted = new Set(names);

  const seriesKeysBySkill = indexSeriesKeysBySeriesSkill(armorCatalog);
  const wantedSeriesKeys = new Set(names.flatMap((n)=> [...(seriesKeysBySkill.get(norm(n)) || [])]));

  const { canonicalByName, tokenBySeriesVariant } = buildGroupTokenIndices(armorCatalog);
  const activeGroupRules = pickActiveGroupTokenRules(selectedSkills, canonicalByName);
  const wantedGroupTokens = new Set(activeGroupRules.map(r => r.token));

  const score = (p) => {
    let sc = 0;
    (p.skills || []).forEach((sk) => { if (wanted.has(sk.name)) sc += weight.skill * (sk.level || 1); });
    const sKey = getSeriesKeyOfPiece(p);
    if (sKey && wantedSeriesKeys.has(sKey)) sc += weight.series;
    if (wantedGroupTokens.size && sKey) {
      const rec = tokenBySeriesVariant.get(sKey);
      if (rec) {
        const tok = rec[_variantKey(p?.variant)];
        if (tok && wantedGroupTokens.has(tok)) sc += weight.group;
      }
    }
    const slotSum = (p.slots || []).reduce((a,b)=>a+(b||0),0);
    sc += slotSum * weight.slot;
    return sc;
  };

  const parts = ["head","chest","arms","waist","legs"];
  const byPart = Object.fromEntries(parts.map(k=>[k,[]]));
  (armorCatalog.armor || []).forEach((p)=> { if (byPart[p.part]) byPart[p.part].push({ ...p, _score: score(p) }); });

  // widen when series or group is requested
  const hasGroup = wantedGroupTokens.size > 0;
  const hasSeries = wantedSeriesKeys.size > 0;
  let limit = limitPerPart;
  if (hasGroup)  limit = Math.max(limit, 16);
  if (hasSeries) limit = Math.max(limit, 14);

  parts.forEach((k) => { byPart[k].sort((a,b)=> b._score - a._score); byPart[k] = byPart[k].slice(0, limit); });
  return byPart;
};

// ===== fast path for group only =====
const fastGroupOnlySets = (selectedSkills, armorCatalog, options = {}) => {
  const { topN = 20 } = options;
  const { canonicalByName, tokenBySeriesVariant } = buildGroupTokenIndices(armorCatalog);
  const tokens = selectedSkills.map(s => (typeof s === "string" ? s : s?.name)).filter(Boolean)
    .map(n => canonicalByName.get(norm(n)) || null).filter(Boolean);
  if (!tokens.length) return [];
  if (tokens.length > 1) {
    // ANDだと6部位相当が必要で難しいので、まずは先頭のみ
    tokens.length = 1;
  }
  const token = tokens[0];
  const pairSet = new Set();
  for (const [key, rec] of tokenBySeriesVariant.entries()) {
    for (const [v, t] of Object.entries(rec)) if (t === token) pairSet.add(`${key}#${v}`);
  }

  const parts = ["head","chest","arms","waist","legs"];
  const byPartMatch = Object.fromEntries(parts.map(k=>[k,[]]));
  const byPartAny   = Object.fromEntries(parts.map(k=>[k,[]]));
  const score = (p) => (p.slots||[]).reduce((a,b)=>a+(b||0),0);
  (armorCatalog.armor || []).forEach((p)=>{
    if (!byPartAny[p.part]) return;
    const sKey = getSeriesKeyOfPiece(p);
    const vKey = _variantKey(p?.variant);
    const ok   = pairSet.has(`${sKey}#${vKey}`);
    if (ok) byPartMatch[p.part].push({ ...p, _score: score(p) });
    byPartAny[p.part].push({ ...p, _score: score(p) });
  });
  parts.forEach((k)=>{
    byPartMatch[k].sort((a,b)=> b._score - a._score); byPartMatch[k] = byPartMatch[k].slice(0, 8);
    byPartAny[k].sort((a,b)=> b._score - a._score);   byPartAny[k]   = byPartAny[k].slice(0, 8);
  });

  const usableParts = parts.filter(k => byPartMatch[k].length > 0);
  if (usableParts.length < 3) return [];

  let combos = [];
  const pool = usableParts.slice(0, 4);
  for (let i=0;i<pool.length;i++) for (let j=i+1;j<pool.length;j++) for (let k=j+1;k<pool.length;k++) {
    combos.push([pool[i], pool[j], pool[k]]);
  }
  if (!combos.length) combos = [usableParts.slice(0,3)];

  const results = [];
  for (const parts3 of combos) {
    const picked = {};
    const remaining = new Set(parts);
    parts3.forEach((pt)=> { picked[pt] = byPartMatch[pt][0]; remaining.delete(pt); });
    remaining.forEach((pt)=> { picked[pt] = (byPartMatch[pt][0]) || (byPartAny[pt][0]) || null; });

    const H = picked.head, C = picked.chest, A = picked.arms, W = picked.waist, L = picked.legs;
    if (!H || !C || !A || !W || !L) continue;

    const piecesObj = { head:H, chest:C, arms:A, waist:W, legs:L };
    const act = summarizeActivations(piecesObj, armorCatalog);
    const cnt = (act.groups || []).find(g => g.token === token)?.count || 0;
    if (cnt < 3) continue;

    results.push({
      coverageWidth: (H.slots||[]).length + (C.slots||[]).length + (A.slots||[]).length + (W.slots||[]).length + (L.slots||[]).length,
      satisfiedRatio: 1,
      leftoverSlots: [],
      pieces: piecesObj,
      talisman: null,
      decorations: [],
      activatedSeries: act.series,
      activatedGroups: act.groups,
      allSkills: summarizeAllSkillsFromResult(piecesObj, null, []),
      detail: buildResultDetail(H, C, A, W, L, null, [], act),
    });
  }
  results.sort((a,b)=> b.coverageWidth - a.coverageWidth);
  return results.slice(0, topN);
};

// ===== main =====
export const computeTopSets = (
  selectedSkills,
  armorCatalog,
  decorationsCatalog,
  talismansCatalog,
  options = {}
) => {
  if (!selectedSkills?.length) return [];

  const { kPerPart = 6, topN = 20, includeWeaponSlots = [], allowAppraisedTalismans = false } = options;

  // Build requirement map
  const required = new Map();
  selectedSkills.forEach((s) => {
    const name = typeof s === "string" ? s : s?.name;
    const lv = typeof s === "string" ? 1 : s?.requiredLevel ?? s?.level ?? s?.lv ?? 1;
    if (name) required.set(name, Math.max(lv, required.get(name) || 0));
  });

  // Series prep
  const seriesKeysBySkill = indexSeriesKeysBySeriesSkill(armorCatalog);
  const seriesThresholds  = indexSeriesThresholds(armorCatalog);

  // Group prep
  const { canonicalByName, tokenBySeriesVariant: groupIndex } = buildGroupTokenIndices(armorCatalog);
  const activeGroupRules = pickActiveGroupTokenRules(selectedSkills, canonicalByName);
  // Remove group tokens from required (they're not fillable by decos)
  activeGroupRules.forEach(r => r.names.forEach(nm => required.delete(nm)));

  // Series groups (aggregate across keys)
  const requiredSeriesGroups = [];
  for (const [nm, lv] of required) {
    const keysSet = seriesKeysBySkill.get(norm(nm));
    if (!keysSet || !keysSet.size) continue;
    const keys = [...keysSet];
    const idx  = Math.max(1, lv) - 1;
    const need = Math.min(...keys.map((k) => {
      const th = seriesThresholds.get(k) || [2];
      const i  = Math.min(idx, th.length - 1);
      return th[i];
    }));
    requiredSeriesGroups.push({ name: nm, keys, need });
  }
  requiredSeriesGroups.forEach((g) => required.delete(g.name));

  // Fast path: only groups
  const onlyGroups = (required.size === 0) && (requiredSeriesGroups.length === 0) && (activeGroupRules.length > 0);
  if (onlyGroups) return fastGroupOnlySets(selectedSkills, armorCatalog, { topN });

  // Decorations
  const decorations = normalizeDecorations(decorationsCatalog);
  const decoBySkill = indexDecorationsBySkill(decorations);

  // Per-part candidates with series & group boost
  let kPerPartEff = kPerPart;
  if (activeGroupRules.length) kPerPartEff = Math.max(kPerPartEff, 16);
  if (requiredSeriesGroups.length) kPerPartEff = Math.max(kPerPartEff, 14);
  const byPart = pickArmorCandidates(selectedSkills, armorCatalog, { limitPerPart: kPerPartEff });

  // Talismans (craftable up to requested level)
  const talismanCandidates = [{ name: null, slots: [], skills: [] }]
    .concat(buildTalismanCandidates(talismansCatalog, required, { includeAppraised: allowAppraisedTalismans }));

  const addSkills = (map, skills = []) => {
    const out = new Map(map);
    skills.forEach((sk) => out.set(sk.name, (out.get(sk.name) || 0) + (sk.level || 1)));
    return out;
  };

  const results = [];
  const tryPlace = (missingMap, slotsArr) => {
    const slots = [...slotsArr].sort((a,b)=>b-a);
    const used = [];
    for (const [name, needLv] of missingMap) {
      let rest = needLv;
      const list = decoBySkill.get(name) || [];
      let i = 0;
      while (rest > 0 && i < list.length) {
        const j = list[i];
        if (tryPlaceIntoSlots(slots, j.slot)) {
          used.push({ key:j.key, name:j.name, slot:j.slot, skill:name, add:j.level });
          rest -= j.level;
        } else i++;
      }
      if (rest > 0) return { ok:false };
    }
    return { ok:true, used, leftoverSlots: slots };
  };

  const parts = ["head","chest","arms","waist","legs"];
  const Hs = byPart.head || [], Cs = byPart.chest || [], As = byPart.arms || [], Ws = byPart.waist || [], Ls = byPart.legs || [];

  for (let hi=0; hi<Hs.length; hi++) {
    const H = Hs[hi];
    for (let ci=0; ci<Cs.length; ci++) {
      const C = Cs[ci];
      for (let ai=0; ai<As.length; ai++) {
        const A = As[ai];
        for (let wi=0; wi<Ws.length; wi++) {
          const W = Ws[wi];
          for (let li=0; li<Ls.length; li++) {
            const L = Ls[li];
            const pcs = [H,C,A,W,L];

            // Series gate: aggregate across keys
            const seriesCount = new Map();
            pcs.forEach((p)=>{ const k = getSeriesKeyOfPiece(p); if (k) seriesCount.set(k, (seriesCount.get(k)||0)+1); });
            let passSeries = true;
            for (const g of requiredSeriesGroups) {
              const sum = g.keys.reduce((a,k)=> a + (seriesCount.get(k)||0), 0);
              if (sum < g.need) { passSeries = false; break; }
            }
            if (!passSeries) continue;

            // Group gate (AND, threshold 3 per token)
            let passGroups = true;
            for (const rule of activeGroupRules) {
              let cnt = 0;
              for (const p of pcs) {
                const rec = groupIndex.get(getSeriesKeyOfPiece(p));
                if (!rec) continue;
                const tok = rec[_variantKey(p?.variant)];
                if (tok === rule.token) cnt++;
              }
              if (cnt < (rule.threshold || 3)) { passGroups = false; break; }
            }
            if (!passGroups) continue;

            const baseSlots = [
              ...(H?.slots||[]), ...(C?.slots||[]), ...(A?.slots||[]), ...(W?.slots||[]), ...(L?.slots||[]),
              ...(includeWeaponSlots||[]),
            ].filter((n)=> Number.isFinite(n) && n>0);

            const baseSkills = pcs.flatMap(p=>p.skills||[]);
            const baseMap = addSkills(new Map(), baseSkills);

            const missing0 = new Map();
            for (const [nm, reqLv] of required) {
              const have = baseMap.get(nm) || 0;
              if (have < reqLv) missing0.set(nm, reqLv - have);
            }

            for (const T of talismanCandidates) {
              // apply talisman skills first
              const afterT = new Map(missing0);
              (T?.skills || []).forEach((sk)=>{
                const need = afterT.get(sk.name) || 0;
                if (need <= 0) return;
                const rest = Math.max(0, need - (sk.level || 1));
                if (rest === 0) afterT.delete(sk.name); else afterT.set(sk.name, rest);
              });

              const fill = (function(){
                const slots = baseSlots.concat(T?.slots || []);
                return tryPlace(afterT, slots);
              })();
              if (!fill.ok) continue;

              let reqSum = 0, haveSum = 0;
              for (const [nm, reqLv] of required) {
                reqSum += reqLv;
                const got = (baseMap.get(nm)||0) + ((T?.skills||[]).find(s=>s.name===nm)?.level || 0);
                const add = fill.used.filter(u=>u.skill===nm).reduce((a,b)=>a+(b.add||0),0);
                haveSum += Math.min(reqLv, got + add);
              }

              const piecesObj = { head:H, chest:C, arms:A, waist:W, legs:L };
              const act = summarizeActivations(piecesObj, armorCatalog);

              results.push({
                coverageWidth: (baseSlots.length + (T?.slots?.length||0)),
                satisfiedRatio: reqSum ? haveSum/reqSum : 1,
                leftoverSlots: fill.leftoverSlots,
                pieces: piecesObj,
                talisman: T?.name ? { name: T.name, slots: T.slots, skills: T.skills } : null,
                decorations: fill.used,
                activatedSeries: act.series,
                activatedGroups: act.groups,
                allSkills: summarizeAllSkillsFromResult(piecesObj, T?.name ? { name: T.name, slots: T.slots, skills: T.skills } : null, fill.used),
                detail: buildResultDetail(H,C,A,W,L, T?.name ? { name: T.name, slots: T.slots, skills: T.skills } : null, fill.used, act),
              });
            }
          }
        }
      }
    }
  }

  results.sort((a,b)=> {
    if (b.satisfiedRatio !== a.satisfiedRatio) return b.satisfiedRatio - a.satisfiedRatio;
    const sa = (a.leftoverSlots||[]).reduce((p,c)=>p+c,0), sb = (b.leftoverSlots||[]).reduce((p,c)=>p+c,0);
    return sb - sa;
  });

  return results.slice(0, topN);
};

export default { pickArmorCandidates, computeTopSets };
