// src/screens/equip.styles.js
import { StyleSheet, Platform } from "react-native";

export const s = StyleSheet.create({
  // ===== Page =====
  container: { flex: 1, backgroundColor: "#efefef" },
  body: { padding: 16, gap: 16 },

  h1: { fontSize: 20, fontWeight: "700" },
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#f6f6f6",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 6,
  },

  // ===== Search / Tags =====
  searchRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  caption: { fontSize: 12, color: "#666" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fafafa",
  },

  tagsRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#f3f3f3",
  },
  chipSel: { backgroundColor: "#222" },
  chipText: { fontSize: 13, color: "#222" },
  chipTextSel: { color: "#fff" },

  // ===== Groups / Grid =====
  groupBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    overflow: "visible",
  },
  groupTitle: { fontWeight: "700", marginBottom: 10 },

  // 可変列ラッパ（子要素に width:col% を当てる）
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
    overflow: "visible",
  },

  // ===== Card =====
  skillBox: {
    width: "100%",       // 親（カラム）に追従
    minWidth: 0,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    position: "relative",
    overflow: "visible",
  },
  skillBoxSel: { borderColor: "#8ab4ff", backgroundColor: "#f5f9ff" },
  skillBoxText: { fontSize: 13, fontWeight: "700" },
  skillBoxSub: { fontSize: 11, color: "#666", marginTop: 2 },

  // ===== Tooltip =====
  tooltipWrap: {
    position: "absolute",
    top: -6,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5000,
    pointerEvents: "none",
  },
  tooltip: {
    maxWidth: 240,
    backgroundColor: "#111",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  tooltipText: { color: "#fff", fontSize: 11, lineHeight: 15 },
  tooltipArrow: {
    position: "absolute",
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#111",
  },

  // ===== Right fixed panel =====
  rightFixed: {
    position: Platform.select({ web: "fixed", default: "absolute" }),
    right: 16,
    bottom: 16,
    zIndex: 2000,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#cfcfcf",
    borderRadius: 12,
    padding: 12,
  },
  panelTitle: { fontWeight: "700", marginBottom: 8 },
  rowThin: {
    height: 28,
    borderWidth: 1,
    borderColor: "#e6e6e6",
    borderRadius: 6,
    justifyContent: "center",
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  rowThinText: { color: "#333" },

  panelSection: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#eee" },
  panelHeader: { fontWeight: "700", marginBottom: 6 },
  kvRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  kvKey: { color: "#666" },
  kvVal: { fontWeight: "700" },
  tableRow: { flexDirection: "row", gap: 8, marginBottom: 6, overflow: "visible", zIndex: 1 },
  cell: { flex: 1, borderWidth: 1, borderColor: "#e6e6e6", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 8, position:"relative" , overflow: "visible", zIndex: 1 },

  // ===== Controls =====
  stepRow: { flexDirection: "row", gap: 6, marginTop: 8 , position:"relative" , overflow: "visible"},
  stepBtnSm: {
    minWidth: 30,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  stepTxtSm: { fontSize: 12, fontWeight: "700" },

  // 旧スタイル互換（未使用なら削除可）
  stepBtn: { minWidth: 36, height: 28, borderRadius: 8, borderWidth: 1, borderColor: "#d0d0d0", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  stepTxt: { fontSize: 14, fontWeight: "700" },

  rowSel: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e6e6e6", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, marginBottom: 6, gap: 8 },
  rowSelName: { flex: 1, color: "#222" },
  rowSelCtrls: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepMini: { width: 28, height: 24, borderRadius: 6, borderWidth: 1, borderColor: "#d0d0d0", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  lvBadge: { fontSize: 12, fontWeight: "700", paddingHorizontal: 6 },
  clearMini: { width: 24, height: 24, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: "#f2f2f2" },
  clearMiniTxt: { color: "#888", fontWeight: "700" },
  hint: { fontSize: 11, color: "#777", marginTop: 4 },
  clearAllBtn: { marginTop: 6, backgroundColor: "#f6f6f6", borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  clearAllTxt: { color: "#333", fontWeight: "700" },

  // ===== Level dropdown (global fixed menu) =====
  sel: {
    minWidth: 60,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 6,
  },
  selText: { fontSize: 12, fontWeight: "700" },
  selMenu: {
    // index.js 側で position:"fixed", left/top を上書き
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    paddingVertical: 4,
    maxHeight: 220,
    overflow: "auto",
    zIndex: 13000,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 12,
  },
  selOpt: { paddingVertical: 8, paddingHorizontal: 12 },
  selOptSel: { backgroundColor: "#eef4ff" },
  selOptText: { fontSize: 13 },

  // クリックで閉じる透明オーバーレイ
  backdrop: {
    position: Platform.select({ web: "fixed", default: "absolute" }),
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "transparent",
    zIndex: 12000,
  },

  // --- 検索UI ---
searchRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 8,
},
searchBox: {
  flex: 1,
  position: "relative",
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 8,
  backgroundColor: "#fff",
},
searchInput: {
  fontSize: 16,
  lineHeight: 20,
},
searchClear: {
  position: "absolute",
  right: 6,
  top: 6,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
},
searchClearText: {
  fontSize: 18,
},
searchMeta: {
  minWidth: 64,
  textAlign: "right",
  opacity: 0.7,
},

headerLink: { fontSize: 14, color: "#2563eb", fontWeight: "600", paddingHorizontal: 6, paddingVertical: 4 },

// タブ切替（本文先頭）
tabsRow: { flexDirection: "row", gap: 8, marginTop: 6 },
tabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#ececec", borderWidth: 1, borderColor: "#e3e3e3" },
tabBtnActive: { backgroundColor: "#222" },
tabBtnText: { fontSize: 13, color: "#222", fontWeight: "600" },
tabBtnTextActive: { color: "#fff" },

// サブヘッダー（バッジ）
pageHeader: { marginTop: 4, marginBottom: 6 },
pageBadge: {
  alignSelf: "flex-start",
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  backgroundColor: "#fff",
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "#E5E7EB",
  paddingHorizontal: 10,
  paddingVertical: 10,
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
},
pageBadgeIcon: { fontSize: 14 },
pageBadgeText: { fontSize: 13, fontWeight: "700", color: "#111" },

// タブ（既存のを少しだけ整えるなら）
tabsRow: { flexDirection: "row", gap: 8, marginTop: 4, marginBottom: 8 },
tabBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#ECECEC", borderWidth: 1, borderColor: "#E5E7EB" },
tabBtnActive: { backgroundColor: "#111", borderColor: "#111" },
tabBtnText: { fontSize: 13, color: "#111", fontWeight: "700" },
tabBtnTextActive: { color: "#fff" },


});

