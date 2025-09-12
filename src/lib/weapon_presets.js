// src/lib/weapon_presets.js
// ローカル保存する「アーティア武器」プリセット管理と、生産武器一覧（最終強化のみ）の供給口。

export const WEAPON_PRESET_KEY = "mhwlds_weapon_presets_v1";

// localStorage ラッパー（webのみ）。Nativeは呼び出し側で別実装に差し替え可。
const store = {
  get(key, fallback = []) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const v = window.localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      }
    } catch {}
    return fallback;
  },
  set(key, val) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(val));
      }
    } catch {}
  },
};

export function loadPresets() {
  return store.get(WEAPON_PRESET_KEY, []);
}
export function savePresets(list) {
  store.set(WEAPON_PRESET_KEY, list);
}
export function addPreset(name, data) {
  const list = loadPresets();
  const item = { id: Date.now(), name, data };
  list.push(item);
  savePresets(list);
  return item;
}
export function updatePreset(id, patch) {
  const list = loadPresets();
  const idx = list.findIndex(p => p.id === id);
  if (idx >= 0) { list[idx] = { ...list[idx], ...patch }; savePresets(list); }
  return loadPresets();
}
export function deletePreset(id) {
  savePresets(loadPresets().filter(p => p.id !== id));
  return loadPresets();
}

// ========= 生産武器（最終強化のみ） =========
// プロジェクトに武器カタログがあれば import してここでフィルタする。
// 無い場合は空配列を返す（UI 側で「未導入」と表示）。
let _finalsCache = null;
export async function loadProductionFinals(fetcher) {
  // fetcher: () => Promise<WeaponCatalog> の形を想定（任意）
  if (_finalsCache) return _finalsCache;
  if (fetcher) {
    try {
      const cat = await fetcher();
      // 例：cat.weapons: [{ name, weaponType, treeId, stage, ... }]
      const finals = (cat?.weapons || []).filter(w => String(w.stage||"").toLowerCase() === "final");
      _finalsCache = finals;
      return finals;
    } catch (e) {
      console.warn("weapon finals load failed:", e);
    }
  }
  _finalsCache = [];
  return _finalsCache;
}
