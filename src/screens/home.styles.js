import { StyleSheet, Platform } from "react-native"
import { FONTS, SPACING, COLORS, RADII } from "../styles/tokens"

export const s = StyleSheet.create({
    wrap: { padding: SPACING.xl, gap: SPACING.xl },

    title: { fontSize: FONTS.title, fontWeight: "700", color: COLORS.text },
    sub: { fontSize: FONTS.small, color: COLORS.subText },

    input: {
        height: 40,
        borderWidth: 1,
        borderRadius: RADII.sm,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.white
    },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: SPACING.md,
    },


    card: {
        width: "48%",
        minHeight: 96,
        backgroundColor: COLORS.cardBg,
        borderRadius: RADII.md,
        padding: SPACING.lg,
        borderWidth: 1, borderColor: COLORS.border,
        ...(Platform.OS === "web"
            ? { boxShadow: "0 2px 8px rgba(0,0,0,0.06)", transition: "transform 120ms ease" }
            : { elevation: 2 }),
    },



    cardHover: Platform.OS === "web" ? { transform: "translateY(-2px)" } : {},
    cardPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },

    emoji: { fontSize: FONTS.emoji },
    cardTitle: { fontSize: FONTS.body, fontWeight: "600", color: COLORS.text },
    badge: {
        alignSelf: "flex-start",
        fontSize: 12,
        paddingHorizontal: SPACING.md,
        paddingVertical: 2,
        borderRadius: RADII.pill,
        backgroundColor: COLORS.badgeBg,
    },


    footer: { textAlign: "center", marginTop: SPACING.xxl, color: COLORS.subText },
})