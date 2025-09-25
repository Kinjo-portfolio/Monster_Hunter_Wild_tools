// 武器専用スキル判定
import { isWeaponSkill } from "./weapon_skills.canonical";



// src/domains/skills/calculators/gear_finder.js
// ------------------------------------------------------------
// ギアファインダー（武器対応版）
//
// ・options.weaponSlots / weaponSkills / weaponName を受け取る
// ・武器スキルを基礎ポイントに加算
// ・装飾品の設置先を origin: "weapon" | "armor" で区別
// ・余りスロットを leftoverArmorSlots / leftoverWeaponSlots に分離
// ・結果 result.weapon { name, slots, skills } を追加
// ・詳細HTML（buildResultDetail）に武器行／武器用・防具用装飾品行を出力
// ------------------------------------------------------------

/* ====== 詳細表示ヘルパ（後方互換を保持） ====== */
(function () {
  const _add = (m, name, lv) => {
    if (!name || !lv) return;
    m.set(name, (m.get(name) || 0) + lv);
  };

  if (typeof window !== "undefined") {
    // 合計スキル（武器を第4引数で受け取れるように）
    window.summarizeAllSkillsFromResult = function (pieces, talisman, decorations, weapon) {
      const m = new Map();
      const parts = [pieces?.head, pieces?.chest, pieces?.arms, pieces?.waist, pieces?.legs];
      parts.forEach(p => (p?.skills || []).forEach(s => _add(m, s.name, s.level || 1)));
      (talisman?.skills || []).forEach(s => _add(m, s.name, s.level || 1));
      (decorations || []).forEach(d => _add(m, d.skill || d.name, d.add || d.level || 1));
      (weapon?.skills || []).forEach(ws => _add(m, ws.name, ws.level || 1));
      return [...m.entries()]
        .sort((a,b)=>a[0].localeCompare(b[0], "ja"))
        .map(([name, level]) => ({ name, level }));
    };

    // 詳細HTML（末尾に weaponInfo を追加できるように）
    window.buildResultDetail = function (H, C, A, W, L, T, usedDecos, activations, weaponInfo) {
      const equipLine = [
        `頭 ${H?.name || "-"}`,
        `胴 ${C?.name || "-"}`,
        `腕 ${A?.name || "-"}`,
        `腰 ${W?.name || "-"}`,
        `脚 ${L?.name || "-"}`,
        `護石 ${T?.name || "なし"}`
      ].join(" / ");
      const weaponLine = weaponInfo?.name
        ? `武器：${weaponInfo.name}　スロット：${(weaponInfo.slots || []).join("-") || "なし"}`
        : "";

      const bySkill = new Map();
      const push = (name, src, lv) => {
        if (!name || !lv) return;
        const row = bySkill.get(name) || { weapon:0, head:0, chest:0, arms:0, waist:0, legs:0, talisman:0, deco:0 };
        row[src] += lv;
        bySkill.set(name, row);
      };
      (H?.skills || []).forEach(s => push(s.name, "head", s.level || 1));
      (C?.skills || []).forEach(s => push(s.name, "chest", s.level || 1));
      (A?.skills || []).forEach(s => push(s.name, "arms", s.level || 1));
      (W?.skills || []).forEach(s => push(s.name, "waist", s.level || 1));
      (L?.skills || []).forEach(s => push(s.name, "legs", s.level || 1));
      (T?.skills || []).forEach(s => push(s.name, "talisman", s.level || 1));
      (weaponInfo?.skills || []).forEach(ws => push(ws.name, "weapon", ws.level || 1));
      (usedDecos || []).forEach(d => push(d.skill || d.name, "deco", d.add || d.level || 1));

      const perSkill = [...bySkill.entries()]
        .map(([name, r]) => {
          const total = r.weapon + r.head + r.chest + r.arms + r.waist + r.legs + r.talisman + r.deco;
          return { name, ...r, total, label:`${name}Lv${total}` };
        })
        .sort((a,b)=>b.total - a.total || a.name.localeCompare(b.name, "ja"));

      // 装飾品（武器 / 防具）を集計
      const decoCountsArmor = new Map();
      const decoCountsWeapon = new Map();
      (usedDecos || []).forEach(d => {
        const key = d.name || `${d.skill || ""}【${d.slot || ""}】`;
        (d.origin === "weapon" ? decoCountsWeapon : decoCountsArmor)
          .set(key, ((d.origin === "weapon" ? decoCountsWeapon : decoCountsArmor).get(key) || 0) + 1);
      });
      const decoListArmor = [...decoCountsArmor.entries()].map(([name,count])=>({name,count}))
        .sort((a,b)=>b.count-a.count || a.name.localeCompare(b.name,"ja"));
      const decoListWeapon = [...decoCountsWeapon.entries()].map(([name,count])=>({name,count}))
        .sort((a,b)=>b.count-a.count || a.name.localeCompare(b.name,"ja"));

      const serLine = (activations?.series?.length)
        ? `発動シリーズ：` + activations.series.map(s => `${s.name}（${s.count}/${s.required}：${s.stageName}）`).join(" / ")
        : "";
      const grpLine = (activations?.groups?.length)
        ? `発動グループ：` + activations.groups.map(g => `${g.token} ×${g.count}`).join(" / ")
        : "";

      const html = [
        `<div class="result-detail">`,
        weaponLine ? `<div class="weapon-line">${weaponLine}</div>` : ``,
        `<div class="equip-line">${equipLine}</div>`,
        serLine ? `<div class="activated-line series">${serLine}</div>` : ``,
        grpLine ? `<div class="activated-line groups">${grpLine}</div>` : ``,
        `<table class="skills-table"><thead><tr><th>ポイント</th><th>武器</th><th>頭</th><th>胴</th><th>腕</th><th>腰</th><th>脚</th><th>護石</th><th>装飾品</th><th>合計</th><th>発動スキル</th></tr></thead><tbody>`,
        ...perSkill.map(r => `<tr><td>${r.name}</td><td>${r.weapon||0}</td><td>${r.head||0}</td><td>${r.chest||0}</td><td>${r.arms||0}</td><td>${r.waist||0}</td><td>${r.legs||0}</td><td>${r.talisman||0}</td><td>${r.deco||0}</td><td>${r.total}</td><td>${r.label}</td></tr>`),
        `</tbody></table>`,
        decoListWeapon.length ? `<div class="deco-line weapon">武器用装飾品 ${decoListWeapon.map(d=>`${d.name} ×${d.count}`).join(" / ")}</div>` : ``,
        decoListArmor.length ? `<div class="deco-line armor">防具用装飾品 ${decoListArmor.map(d=>`${d.name} ×${d.count}`).join(" / ")}</div>` : ``,
        `</div>`
      ].join("");

      return { equipLine, weaponLine, perSkill, decoListArmor, decoListWeapon, activations, html };
    };
  } else {
    // 非Web環境のフォールバック
    globalThis.summarizeAllSkillsFromResult = () => [];
    globalThis.buildResultDetail = () => ({ equipLine:"", weaponLine:"", perSkill:[], decoListArmor:[], decoListWeapon:[], activations:null, html:"" });
  }
})();

/* ====== 共通ユーティリティ ====== */
const norm = (s) => String(s || "").normalize("NFKC").replace(/[・\s　()（）\[\]【】]/g, "").toLowerCase();
const _variantKey = (v) => {
  const s = String(v || "").trim();
  if (s === "α" || /alpha/i.test(s)) return "alpha";
  if (s === "β" || /beta/i.test(s)) return "beta";
  if (s === "γ" || /gamma/i.test(s)) return "gamma";
  return s.toLowerCase();
};
const getSeriesKeyOfPiece = (p) => p?.seriesKey ?? p?.series ?? p?.setKey ?? p?.series_key ?? null;

/* ====== シリーズ / グループ関連 ====== */
const buildGroupTokenIndices = (armorCatalog) => {
  const tokens = new Set();
  (armorCatalog?.series || []).forEach(s => {
    const gs = s?.groupSkill; if (!gs) return;
    Object.values(gs).forEach(v => v && tokens.add(String(v)));
  });
  const canonicalByName = new Map(); tokens.forEach(n => canonicalByName.set(norm(n), n));
  const tokenBySeriesVariant = new Map();
  (armorCatalog?.series || []).forEach(s => {
    const gs = s?.groupSkill; if (!gs) return;
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
  const names = (selectedSkills || []).map(s => typeof s === "string" ? s : s?.name).filter(Boolean);
  const rulesMap = new Map();
  names.forEach(n => {
    const canon = canonicalByName.get(norm(n)); if (!canon) return;
    if (!rulesMap.has(canon)) rulesMap.set(canon, { token: canon, threshold: 3, names: new Set() });
    rulesMap.get(canon).names.add(n);
  });
  return [...rulesMap.values()].map(r => ({ token: r.token, threshold: r.threshold, names: [...r.names] }));
};
const indexSeriesKeysBySeriesSkill = (armorCatalog) => {
  const m = new Map();
  const add = (nm, key) => { const k = norm(nm); if (!k || !key) return; if (!m.has(k)) m.set(k, new Set()); m.get(k).add(key); };
  (armorCatalog?.series || []).forEach(s => {
    const key = s?.key, nm = s?.seriesSkill?.name;
    if (key && nm) add(nm, key);
    const ths = s?.seriesSkill?.thresholds;
    if (key && Array.isArray(ths)) ths.forEach(t => t?.name && add(t.name, key));
  });
  return m;
};
const indexSeriesThresholds = (armorCatalog) => {
  const m = new Map();
  (armorCatalog?.series || []).forEach(s => {
    const ths = Array.isArray(s?.seriesSkill?.thresholds) ? s?.seriesSkill?.thresholds : [];
    const arr = ths.map(t => Number(t?.count || 0)).filter(n => n > 0);
    m.set(s.key, arr.length ? arr : [2]);
  });
  return m;
};
const indexSeriesThresholdNames = (armorCatalog) => {
  const m = new Map();
  (armorCatalog?.series || []).forEach(s => {
    const ths = Array.isArray(s?.seriesSkill?.thresholds) ? s?.seriesSkill?.thresholds : [];
    m.set(s.key, ths.map(t => ({ count: Number(t?.count || 0) || 0, name: t?.name || "" })));
  });
  return m;
};
const indexSeriesMap = (armorCatalog) => {
  const m = new Map();
  (armorCatalog?.series || []).forEach(s => m.set(s.key, s));
  return m;
};

/* ====== 装飾品 ====== */
const normalizeDecorations = (decoCatalog) => {
  const raw = decoCatalog?.decorations || [];
  return raw.map((d) => {
    const hasWeaponOnlySkill =
      Array.isArray(d.skills) && d.skills.some((sk) => isWeaponSkill(sk?.name));
    const fromType =
      d.type === "武器用" || d.scope === "weapon" || d.for === "weapon" || d.category === "weapon";
    const weaponOnly = !!(hasWeaponOnlySkill || fromType);

    return {
      key: d.key || d.id || d.name,
      name: d.name || "",
      slot: Number(d.slot ?? 1) || 1,
      weaponOnly, // ← ここに落とし込む
      skills: (Array.isArray(d.skills) ? d.skills : []).map((sk) => ({
        name: sk.name,
        level: Number(sk.level ?? 1) || 1,
      })),
    };
  }).filter((x) => x.name && x.slot > 0 && x.skills?.length);
};

const indexDecorationsBySkill = (decorations) => {
  const map = new Map();
  decorations.forEach(d => (d.skills || []).forEach(sk => {
    const list = map.get(sk.name) || [];
    list.push({ key: d.key, name: d.name, slot: d.slot, level: sk.level || 1 });
    map.set(sk.name, list);
  }));
  for (const [k, list] of map) list.sort((a,b)=> (a.slot - b.slot) || (b.level - a.level));
  return map;
};
const tryPlaceIntoSlotsLabeled = (slots, need) => {
  // slots: [{ size, origin }]
  let idx = -1, best = Infinity;
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (s.size >= need && s.size < best) { best = s.size; idx = i; }
  }
  if (idx === -1) return false;
  const [picked] = slots.splice(idx, 1);
  return picked; // 消費したスロット情報を返す
};

/* ====== 護石 ====== */
const buildTalismanCandidates = (talismansCatalog, requiredMap, { includeAppraised = false } = {}) => {
  const list = [{ name: null, slots: [], skills: [] }]; // なし候補
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

/* ====== 発動サマリ ====== */
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
  // Group（3部位）
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
  return {
    series: seriesActivated.sort((a,b)=>a.name.localeCompare(b.name,"ja")),
    groups: groupsActivated.sort((a,b)=>b.count-a.count || a.token.localeCompare(b.token,"ja"))
  };
};

/* ====== 候補抽出（軽い絞り込み） ====== */
export const pickArmorCandidates = (selectedSkills, armorCatalog, { limitPerPart = 12 } = {}) => {
  if (!selectedSkills?.length) return { head:[], chest:[], arms:[], waist:[], legs:[] };

  const seriesKeysBySkill = indexSeriesKeysBySeriesSkill(armorCatalog);
  const names = selectedSkills.map(s => typeof s === "string" ? s : s?.name).filter(Boolean);
  const wantedNormal = new Set();
  const wantedSeriesKeys = new Set();
  for (const name of names) {
    const keys = seriesKeysBySkill.get(norm(name));
    if (keys && keys.size) keys.forEach(k => wantedSeriesKeys.add(k));
    else wantedNormal.add(name);
  }

  const parts = ["head","chest","arms","waist","legs"];
  const byPart = Object.fromEntries(parts.map(k => [k, []]));
  const rel = (p) => {
    if (!p) return false;
    const sKey = getSeriesKeyOfPiece(p);
    if (sKey && wantedSeriesKeys.has(sKey)) return true;
    if ((p.skills || []).some(sk => wantedNormal.has(sk.name))) return true;
    return false;
  };
  const slotSum = (p) => (p.slots || []).reduce((a,b)=>a+(b||0), 0);

  (armorCatalog.armor || []).forEach(p => { if (byPart[p.part]) byPart[p.part].push(p); });

  for (const k of parts) {
    const arr = byPart[k];
    const relevant = arr.filter(rel).sort((a,b)=>slotSum(b)-slotSum(a));
    const rest = arr.filter(p => !rel(p)).sort((a,b)=>slotSum(b)-slotSum(a));
    byPart[k] = relevant.concat(rest).slice(0, Math.max(limitPerPart, relevant.length));
  }

  return byPart;
};

/* ====== 本体：トップセット探索 ====== */
export const computeTopSets = (selectedSkills, armorCatalog, decorationsCatalog, talismansCatalog, options = {}) => {
  if (!selectedSkills?.length) return [];

  const {
    kPerPart = 12,
    topN = 20,
    includeWeaponSlots = [],
    weaponSkills = [],
    weaponName = null,
    allowAppraisedTalismans = false,
  } = options;

  // 必要Lv
  const required = new Map();
  selectedSkills.forEach(s => {
    const name = typeof s === "string" ? s : s?.name;
    const lv = typeof s === "string" ? 1 : s?.requiredLevel ?? s?.level ?? s?.lv ?? 1;
    if (name) required.set(name, Math.max(lv, required.get(name) || 0));
  });

  // シリーズ/グループ準備
  const seriesKeysBySkill = indexSeriesKeysBySeriesSkill(armorCatalog);
  const seriesThresholds = indexSeriesThresholds(armorCatalog);
  const { canonicalByName, tokenBySeriesVariant: groupIndex } = buildGroupTokenIndices(armorCatalog);
  const activeGroupRules = pickActiveGroupTokenRules(selectedSkills, canonicalByName);
  // グループ名で指定されたスキルは required から除去（3部位ルールで判定するため）
  activeGroupRules.forEach(r => r.names.forEach(nm => required.delete(nm)));

  // 指定されたシリーズスキルを部位数条件に置き換え
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
    requiredSeriesGroups.push({ name:nm, keys, need });
  }
  requiredSeriesGroups.forEach(g => required.delete(g.name));

  // 装飾品
  const decorations = normalizeDecorations(decorationsCatalog);
  const decoBySkill = indexDecorationsBySkill(decorations);

  // 候補リスト
  const baseByPart = pickArmorCandidates(selectedSkills, armorCatalog, { limitPerPart: kPerPart });
  const withNull = (part, arr) => [{ part, name:null, slots:[], skills:[], seriesKey:null }, ...(arr || [])];
  const lists = {
    head: withNull("head", baseByPart.head),
    chest: withNull("chest", baseByPart.chest),
    arms: withNull("arms", baseByPart.arms),
    waist: withNull("waist", baseByPart.waist),
    legs: withNull("legs", baseByPart.legs),
  };

  // 護石候補
  const talismanCandidates = buildTalismanCandidates(talismansCatalog, required, { includeAppraised: allowAppraisedTalismans });

  // 武器スキル正規化
  const wSkills = (weaponSkills || []).map(ws => ({
    name: ws.name ?? ws.名称 ?? ws.id,
    level: Number(ws.level ?? ws.レベル ?? 1) || 1,
  })).filter(x => x.name);

  // 装飾品割り当て（武器/防具スロ混在、使用スロの origin を保持）
  const tryPlace = (missingMap, armorSlotsArr, weaponSlotsArr) => {
  // best-fit: 昇順（必要スロ以上で最小のスロットを使う。S3にS2/S1も可）
  const armor  = (armorSlotsArr  || []).filter(n => Number.isFinite(n) && n > 0).sort((a,b)=>a-b);
  const weapon = (weaponSlotsArr || []).filter(n => Number.isFinite(n) && n > 0).sort((a,b)=>a-b);

  const pickSlot = (list, need) => {
    let idx = -1, best = Infinity;
    for (let i = 0; i < list.length; i++) {
      const s = list[i];
      if (s >= need && s < best) { best = s; idx = i; }
    }
    if (idx === -1) return null;
    return list.splice(idx, 1)[0];
  };

  const used = [];

  for (const [name, needLv] of missingMap) {
    let rest = needLv;

    // スキルごとの珠バリアントを level 毎にまとめる
    const variants = (decoBySkill.get(name) || []).slice();
    const byLevel = new Map(); // level -> [{slot,level,name,key}, ...]（slotは小さい順）
    for (const v of variants) {
      const arr = byLevel.get(v.level) || [];
      arr.push(v);
      byLevel.set(v.level, arr);
    }
    for (const arr of byLevel.values()) arr.sort((x,y)=>x.slot - y.slot);

    // ★判定：武器専用は武器スロのみ／一般は防具スロのみ
    const mustWeapon = isWeaponSkill(name);

    while (rest > 0) {
      // 残りポイントに応じて最適な組み合わせを優先（2→3→1 / 1→3→2 / 3→2→1）
      const pref = (rest % 3 === 2) ? [2,3,1]
                : (rest % 3 === 1) ? [1,3,2]
                : [3,2,1];

      let placed = false;

      for (const lvl of pref) {
        const arr = byLevel.get(lvl);
        if (!arr || !arr.length) continue;

        for (const j of arr) {
          if (mustWeapon) {
            // 武器専用：武器スロット“だけ”を使用
            const w = pickSlot(weapon, j.slot);
            if (w != null) {
              used.push({ key:j.key, name:j.name, slot:j.slot, skill:name, add:j.level, origin:"weapon" });
              rest -= lvl; placed = true; break;
            }
          } else {
            // 一般スキル：防具スロット“だけ”を使用（武器には入れない）
            const a = pickSlot(armor, j.slot);
            if (a != null) {
              used.push({ key:j.key, name:j.name, slot:j.slot, skill:name, add:j.level, origin:"armor" });
              rest -= lvl; placed = true; break;
            }
          }
        }
        if (placed) break;
      }

      if (!placed) return { ok:false }; // 要件を満たす置き場が無い
    }
  }

  return {
    ok: true,
    used,
    leftoverArmorSlots: armor,
    leftoverWeaponSlots: weapon,
    leftoverSlots: [...armor, ...weapon], // 互換用
  };
};

  // 探索（使う装備点数が少ない順に）
  const results = [];
  const seriesMap = indexSeriesMap(armorCatalog);
  const thNames = indexSeriesThresholdNames(armorCatalog);

  for (let k = 0; k <= 5; k++) {
    const res = [];
    for (const H of lists.head)
      for (const C of lists.chest)
        for (const A of lists.arms)
          for (const W of lists.waist)
            for (const L of lists.legs) {
              const eq = (H.name?1:0)+(C.name?1:0)+(A.name?1:0)+(W.name?1:0)+(L.name?1:0);
              if (eq !== k) continue;

              // シリーズ/グループのゲート
              const pcsArr = [H,C,A,W,L];
              const seriesCount = new Map();
              pcsArr.forEach(p => { if (!p?.name) return; const key = getSeriesKeyOfPiece(p); if (key) seriesCount.set(key, (seriesCount.get(key)||0)+1); });
              let passSeries = true;
              for (const g of requiredSeriesGroups) {
                const sum = g.keys.reduce((a, key) => a + (seriesCount.get(key) || 0), 0);
                if (sum < g.need) { passSeries = false; break; }
              }
              if (!passSeries) continue;

              let passGroups = true;
              for (const rule of activeGroupRules) {
                let cnt = 0;
                for (const p of pcsArr) {
                  if (!p?.name) continue;
                  const rec = groupIndex.get(getSeriesKeyOfPiece(p));
                  const tok = rec ? rec[_variantKey(p?.variant)] : null;
                  if (tok === rule.token) cnt++;
                }
                if (cnt < (rule.threshold || 3)) { passGroups = false; break; }
              }
              if (!passGroups) continue;

              // 基礎スキル
              const armorSlots = [...(H.slots||[]), ...(C.slots||[]), ...(A.slots||[]), ...(W.slots||[]), ...(L.slots||[])]
                .filter(n => Number.isFinite(n) && n > 0);
              const weaponSlots = (includeWeaponSlots || []).filter(n => Number.isFinite(n) && n > 0);
              const baseSkills = pcsArr.flatMap(p => p?.skills || []);
              const baseMap = new Map();
              baseSkills.forEach(sk => baseMap.set(sk.name, (baseMap.get(sk.name) || 0) + (sk.level || 1)));
              wSkills.forEach(ws => baseMap.set(ws.name, (baseMap.get(ws.name) || 0) + (ws.level || 1)));

              // 不足
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

                const placed = tryPlace(afterT, armorSlots.concat(T?.slots || []), weaponSlots);
                if (!placed.ok) continue;

                const piecesObj = { head: H?.name ? H : null, chest: C?.name ? C : null, arms: A?.name ? A : null, waist: W?.name ? W : null, legs: L?.name ? L : null };
                const talismanObj = T?.name ? { name:T.name, slots:T.slots, skills:T.skills } : null;
                const usedDecos = placed.used;

                const weaponInfo = { name: weaponName, slots: weaponSlots, skills: wSkills };
                const act = summarizeActivations(piecesObj, armorCatalog);

                res.push({
                  leftoverArmorSlots: placed.leftoverArmorSlots,
                  leftoverWeaponSlots: placed.leftoverWeaponSlots,
                  leftoverSlots: placed.leftoverSlots, // 互換
                  pieces: piecesObj,
                  talisman: talismanObj,
                  decorations: usedDecos,
                  weapon: weaponInfo,
                  allSkills: summarizeAllSkillsFromResult(piecesObj, talismanObj, usedDecos, weaponInfo),
                  detail: buildResultDetail(piecesObj.head, piecesObj.chest, piecesObj.arms, piecesObj.waist, piecesObj.legs, talismanObj, usedDecos, act, weaponInfo),
                  activatedSeries: act.series,
                  activatedGroups: act.groups,
                });

                if (res.length > topN * 3) break;
              }
              if (res.length > topN * 3) break;
            }

    // あれば並べ替えてピック
    if (res.length) {
      res.sort((a,b) => {
        // 余りスロ総量（武器+防具）が多い方を優先
        const sa = ([...(a.leftoverArmorSlots||[]), ...(a.leftoverWeaponSlots||[])]).reduce((p,c)=>p+c,0);
        const sb = ([...(b.leftoverArmorSlots||[]), ...(b.leftoverWeaponSlots||[])]).reduce((p,c)=>p+c,0);
        if (sb !== sa) return sb - sa;
        // 使った部位の“早いインデックスが少ない”ほど優先（頭→脚の順で寄せない）
        const ea = [a.pieces.head, a.pieces.chest, a.pieces.arms, a.pieces.waist, a.pieces.legs].reduce((s,p,i)=>s+(p?i:0),0);
        const eb = [b.pieces.head, b.pieces.chest, b.pieces.arms, b.pieces.waist, b.pieces.legs].reduce((s,p,i)=>s+(p?i:0),0);
        return ea - eb;
      });
      results.push(...res.slice(0, topN));
      break; // 最初に見つかったkで確定
    }
  }

  return results.slice(0, topN);
};

export default { pickArmorCandidates, computeTopSets };
