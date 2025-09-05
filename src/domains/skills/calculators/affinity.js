export function totalAffinityRange(selected, skillMap) {
  let min = 0, max = 0;
  for (const [id, lv] of Object.entries(selected || {})) {
    const sk = skillMap.get(id);
    if (!sk) continue;
    const row = (sk.levels || []).find(x => x.level === lv);
    if (!row) continue;
    for (const eff of row.effects || []) {
      const a = eff?.mods?.affinity ?? 0; // 0.20 = +20%
      if (!a) continue;
      if (eff.cond) max += a; else { min += a; max += a; }
    }
  }
  const pct = v => Math.round(v * 100);
  return { minPct: pct(min), maxPct: pct(max) };
}
