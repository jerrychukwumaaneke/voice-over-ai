import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.string().min(1, "Role is required"),
});

export const assignRoleSchema = z.object({
  role: z.string().min(1, "Role is required"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;