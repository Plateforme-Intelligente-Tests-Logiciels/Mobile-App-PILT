import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "@/constants";

export const dashboardStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  heroCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusXl,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.xl,
    marginBottom: SIZES.lg,
  },
  heroEyebrow: {
    color: COLORS.primary,
    fontSize: SIZES.fontSm,
    fontWeight: "700",
    marginBottom: SIZES.sm,
  },
  heroTitle: {
    color: COLORS.text,
    fontSize: SIZES.font2xl,
    fontWeight: "800",
    marginBottom: SIZES.sm,
  },
  heroSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    lineHeight: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  statCard: {
    width: "48%",
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.lg,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: SIZES.radiusRound,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.md,
  },
  statValue: { color: COLORS.text, fontSize: SIZES.fontXl, fontWeight: "800" },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    marginTop: 4,
  },

  sectionCard: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.radiusXl,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontLg,
    fontWeight: "700",
    marginBottom: SIZES.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    textAlign: "center",
    paddingVertical: SIZES.md,
  },

  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.sm,
  },
  activityBullet: {
    width: 8,
    height: 8,
    borderRadius: SIZES.radiusRound,
    backgroundColor: COLORS.primary,
    marginRight: SIZES.md,
  },
  activityContent: { flex: 1 },
  activityTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  activityDetail: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
    marginTop: 2,
  },
  activityTime: { color: COLORS.textSecondary, fontSize: SIZES.fontXs },

  activityMetricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  activityMetricLabel: {
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  activityMetricValue: { color: COLORS.textSecondary, fontSize: SIZES.fontXs },

  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  projectInfo: { flex: 1 },
  projectName: {
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "600",
  },
  projectDetail: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
    marginTop: 2,
  },

  sprintCard: { padding: SIZES.sm },
  sprintName: {
    color: COLORS.text,
    fontSize: SIZES.fontBase,
    fontWeight: "700",
    marginBottom: SIZES.sm,
  },
  sprintObjectif: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    marginBottom: SIZES.sm,
  },
  sprintMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sprintDate: { color: COLORS.textSecondary, fontSize: SIZES.fontXs },

  storyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  storyInfo: { flex: 1 },
  storyTitle: { color: COLORS.text, fontSize: SIZES.fontSm, fontWeight: "600" },
  storyDetail: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
    marginTop: 2,
  },

  sectionActionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  sectionMetaText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
  },
  sectionActionLink: {
    color: COLORS.primary,
    fontSize: SIZES.fontSm,
    fontWeight: "700",
  },
  dualColumn: {
    gap: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  dualColumnItem: {
    width: "100%",
  },

  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  changeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: SIZES.radiusRound,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${COLORS.primary}22`,
    marginRight: SIZES.md,
  },
  changeContent: { flex: 1 },
  changeTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "700",
  },
  changeDetail: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
    marginTop: 2,
  },
  changeTime: { color: COLORS.textSecondary, fontSize: SIZES.fontXs },

  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  notificationIconWrap: {
    width: 32,
    height: 32,
    borderRadius: SIZES.radiusRound,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SIZES.md,
  },
  notificationContent: { flex: 1 },
  notificationTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSm,
    fontWeight: "700",
  },
  notificationMessage: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
    marginTop: 2,
  },
  notificationTime: { color: COLORS.textSecondary, fontSize: SIZES.fontXs },

  badge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: 3,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
  },
  badgeText: { fontSize: SIZES.fontXs, fontWeight: "700" },
});
