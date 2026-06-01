import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const captchas = sqliteTable("captchas", {
  id: text("id").primaryKey(),
  creatorName: text("creator_name").notNull(),
  resultMessage: text("result_message").notNull().default("Error: human detection failed. Please contact your system administrator."),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const captchaImages = sqliteTable("captcha_images", {
  id: text("id").primaryKey(),
  captchaId: text("captcha_id")
    .notNull()
    .references(() => captchas.id),
  imageUrl: text("image_url").notNull(),
  imageKey: text("image_key").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const captchaChallenges = sqliteTable("captcha_challenges", {
  id: text("id").primaryKey(),
  captchaId: text("captcha_id")
    .notNull()
    .references(() => captchas.id),
  question: text("question").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const challengeCorrectImages = sqliteTable("challenge_correct_images", {
  id: text("id").primaryKey(),
  challengeId: text("challenge_id")
    .notNull()
    .references(() => captchaChallenges.id),
  imageId: text("image_id")
    .notNull()
    .references(() => captchaImages.id),
});

// kept for migration compatibility, no longer used in app
export const captchaCompletions = sqliteTable("captcha_completions", {
  id: text("id").primaryKey(),
  captchaId: text("captcha_id")
    .notNull()
    .references(() => captchas.id),
  playerName: text("player_name").notNull(),
  totalScore: integer("total_score").notNull(),
  passedCount: integer("passed_count").notNull().default(0),
  totalChallenges: integer("total_challenges").notNull().default(0),
  completedAt: integer("completed_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
