// シリーズ/グループも対象にしつつ、タグ・キーワードを堅牢に比較
export const filterSkills = (
  list,
  keyword,
  activeTags,
  categories = ['attack', 'crit', 'utility'],
  types = ['normal', 'series', 'group']
) => {
  const k = String(keyword ?? '').trim().toLowerCase();
  const hasTags = (activeTags?.length ?? 0) > 0;
  const norm = (v) => String(v ?? '').replace(/^[#＃]/, '').toLowerCase().trim();

  return (list ?? [])
    // type と category の両方を条件に
    .filter(
      (s) =>
        (!types?.length || types.includes(s?.type ?? 'normal')) &&
        (!categories?.length || categories.includes(s?.category))
    )
    // キーワード（名前）一致
    .filter((s) => !k || norm(s?.name).includes(k))
    // タグ AND 条件（# が混ざっていても OK）
    .filter(
      (s) =>
        !hasTags ||
        activeTags.every((t) =>
          (Array.isArray(s?.tags) ? s.tags : []).some((x) =>
            norm(x).includes(norm(t))
          )
        )
    );
};
