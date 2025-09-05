import { useCallback, useState } from 'react';

export const useSkillSelection = (getMaxLevel) => {
  const [selected, setSelected] = useState({});

  const setLevel = useCallback((id, lv) => {
    const max = getMaxLevel(id);
    const next = Math.max(0, Math.min(lv, max));
    setSelected(prev => {
      const out = { ...prev };
      if (next === 0) delete out[id];
      else out[id] = next;
      return out;
    });
  }, [getMaxLevel]);

  const inc = useCallback((id) => setLevel(id, (selected[id] ?? 0) + 1), [selected, setLevel]);
  const dec = useCallback((id) => setLevel(id, (selected[id] ?? 0) - 1), [selected, setLevel]);
  const clearAll = useCallback(() => setSelected({}), []);

  return { selected, setLevel, inc, dec, clearAll };
};
