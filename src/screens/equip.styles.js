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
    borderWidth: 1,
    borderColor: "#e5e5e5",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

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
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "#f3f3f3" },
  chipSel: { backgroundColor: "#222" },
  chipText: { fontSize: 13, color: "#222" },
  chipTextSel: { color: "#fff" },

  groupBox: { backgroundColor: "#fff", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#dcdcdc" },
  groupTitle: { fontWeight: "700", marginBottom: 10 },
  grid3: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  skillBox: {
    width: "31%",
    minWidth: 120,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fafafa",
  },
  skillBoxText: { fontSize: 13 },

  // 右固定パネル（Webは fixed、ネイティブは absolute）
  rightFixed: {
    position: Platform.select({ web: "fixed", default: "absolute" }),
    right: 16,
    // top: 16,
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
  tableRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  cell: { flex: 1, borderWidth: 1, borderColor: "#e6e6e6", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 8 },
});
