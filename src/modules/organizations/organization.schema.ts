import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;