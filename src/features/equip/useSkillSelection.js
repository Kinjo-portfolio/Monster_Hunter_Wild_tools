import { useCallback, useState } from "react";

export const useSkillSelection = (getMaxLevel) => {
  const [selected, setSelected] = useState({});

  const setLevel = useCallback((id, lv) => {
    setSelected(prev => {
      const max = getMaxLevel(id);
      const next = Math.max(0, Math.min(lv, max));
      if (next === 0) {
        if (prev[id] === undefined) return prev;
        const out = { ...prev };
        delete out[id];
        return out;
      }
      if (prev[id] === next) return prev;
      return { ...prev, [id]: next };
    });
  }, [getMaxLevel]);

  // 連打に強い原子的インクリメント/デクリメント
  const step = useCallback((id, delta) => {
    setSelected(prev => {
      const max = getMaxLevel(id);
      const cur = prev[id] ?? 0;
      const next = Math.max(0, Math.min(cur + delta, max));
      if (next === 0) {
        if (cur === 0) return prev;
        const out = { ...prev };
        delete out[id];
        return out;
      }
      if (cur === next) return prev;
      return { ...prev, [id]: next };
    });
  }, [getMaxLevel]);

  const inc = useCallback((id) => step(id, 1), [step]);
  const dec = useCallback((id) => step(id, -1), [step]);
  const clearAll = useCallback(() => setSelected({}), []);

  return { selected, setLevel, inc, dec, clearAll };
};
