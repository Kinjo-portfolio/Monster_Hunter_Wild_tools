import { StyleSheet, Platform } from "react-native";

export const s = StyleSheet.create({
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

  topRow: { flexDirection: "row", gap: 8 },
  topBtn: {
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#e5e5e5",
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 10,
  },

  searchRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12, gap: 8,
    borderWidth: 1, borderColor: "#eee",
  },
  caption: { fontSize: 12, color: "#666" },
  searchInput: {
    borderWidth: 1, borderColor: "#e5e5e5",
    borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
    backgroundColor: "#fafafa",
  },

  tagsRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12, gap: 8,
    borderWidth: 1, borderColor: "#eee",
  },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "#f3f3f3" },
  chipSel: { backgroundColor: "#222" },
  chipText: { fontSize: 13, color: "#222" },
  chipTextSel: { color: "#fff" },

  groupBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1, borderColor: "#dcdcdc",
    overflow: "visible",
  },
  groupTitle: { fontWeight: "700", marginBottom: 10 },
  grid3: { flexDirection: "row", flexWrap: "wrap", gap: 12, overflow: "visible" },
  cardWrap: { marginBottom: 16 },

  // カード
  skillBox: {
    width: "100%",
    minWidth: 0,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1, borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    position: "relative",
    overflow: "visible",
  },
  skillBoxText: { fontSize: 13, fontWeight: "700" },
  skillBoxSel: { borderColor: "#8ab4ff", backgroundColor: "#f5f9ff" },
  skillBoxSub: { fontSize: 11, color: "#666", marginTop: 4 },

  // Tooltip
  tooltipWrap: {
    position: "absolute", top: -6, left: 0, right: 0,
    alignItems: "center",
    zIndex: 5000,
    pointerEvents: "none",
  },
  tooltip: {
    maxWidth: 220, backgroundColor: "#111",
    paddingVertical: 6, paddingHorizontal: 8,
    borderRadius: 8,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 6,
    elevation: 6,
  },
  tooltipText: { color: "#fff", fontSize: 11, lineHeight: 15 },
  tooltipArrow: {
    position: "absolute", bottom: -6, width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 6,
    borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#111",
  },

  // 右固定パネル
  rightFixed: {
    position: Platform.select({ web: "fixed", default: "absolute" }),
    right: 16, bottom: 16, zIndex: 2000,
  },
  rightPanel: {
    flex: 1, backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#cfcfcf",
    borderRadius: 12, padding: 12,
  },
  panelTitle: { fontWeight: "700", marginBottom: 8 },
  rowThin: {
    height: 28, borderWidth: 1, borderColor: "#e6e6e6",
    borderRadius: 6, justifyContent: "center",
    paddingHorizontal: 8, marginBottom: 6,
  },
  rowThinText: { color: "#333" },

  panelSection: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#eee" },
  panelHeader: { fontWeight: "700", marginBottom: 6 },
  kvRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  kvKey: { color: "#666" },
  kvVal: { fontWeight: "700" },
  tableRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  cell: { flex: 1, borderWidth: 1, borderColor: "#e6e6e6", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 8 },

  // 操作行
  stepRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  stepBtnSm: {
    minWidth: 32, height: 28, borderRadius: 8,
    borderWidth: 1, borderColor: "#d0d0d0",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff",
  },
  stepTxtSm: { fontSize: 13, fontWeight: "700" },

  // プルダウン
  sel: {
    minWidth: 64, height: 28, borderRadius: 8,
    borderWidth: 1, borderColor: "#d0d0d0",
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff",
  },
  selText: { fontSize: 13, fontWeight: "700" },
  selMenu: {
    position: "absolute", top: 32, right: 0,
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#d0d0d0",
    borderRadius: 10, paddingVertical: 6,
    maxHeight: 200, overflow: "hidden",
    zIndex: 13000,
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10,
    elevation: 12,
  },
  selOpt: { paddingVertical: 8, paddingHorizontal: 12 },
  selOptSel: { backgroundColor: "#eef4ff" },
  selOptText: { fontSize: 13 },

  // 互換（未使用なら削除OK）
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

  // ドロップダウンが埋もれないようカードを前面へ
  skillBoxRaised: { zIndex: 12000 },

  // 外側クリックで閉じるオーバーレイ
  backdrop: {
    position: Platform.select({ web: "fixed", default: "absolute" }),
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "transparent",
    zIndex: 11000,
  },
});
