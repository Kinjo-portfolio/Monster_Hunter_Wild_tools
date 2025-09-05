export const SERIES_TIERS = [2, 4];
export const GROUP_THRESHOLD = 3;

export const seriesLevelFromPieces = (pieces) => {
  if (pieces >= 4) return 4;
  if (pieces >= 2) return 2;
  return 0;
};

export const getSeriesActiveEffect = (seriesSkill, pieces) => {
  const lv = seriesLevelFromPieces(pieces);
  if (!lv) return null;
  return (seriesSkill?.levels ?? []).find(e => e.level === lv) ?? null;
};

export const isGroupActive = (pieces) => pieces >= GROUP_THRESHOLD;
