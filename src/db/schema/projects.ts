import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { organizations } from "./organizations";
import { users } from "./users";
import { projectStatusEnum } from "./enums";
import { projectMembers } from "./members";

export const languages = pgTable(
  "languages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 10 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
  },
  (table) => ({
    codeUniqueIdx: uniqueIndex("languages_code_unique_idx").on(table.code),
  }),
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: projectStatusEnum("status").notNull().default("active"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    orgIdIdx: index("projects_org_id_idx").on(table.organizationId),
  }),
);

export const projectLanguages = pgTable(
  "project_languages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    languageId: uuid("language_id")
      .notNull()
      .references(() => languages.id, { onDelete: "restrict" }),
  },
  (table) => ({
    projectLangUniqueIdx: uniqueIndex("project_languages_unique_idx").on(
      table.projectId,
      table.languageId,
    ),
  }),
);

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  members: many(projectMembers),
  languages: many(projectLanguages),
}));

export const projectLanguagesRelations = relations(
  projectLanguages,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectLanguages.projectId],
      references: [projects.id],
    }),
    language: one(languages, {
      fields: [projectLanguages.languageId],
      references: [languages.id],
    }),
  }),
);
