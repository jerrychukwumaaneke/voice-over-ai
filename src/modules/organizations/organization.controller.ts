import { Request, Response, NextFunction } from "express";
import { createOrganizationSchema, updateOrganizationSchema } from "./organization.schema";
import { createOrganization, updateOrganization } from "./organization.service";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createOrganizationSchema.parse(req.body);
    const org = await createOrganization(req.user!.userId, input);
    res.status(201).json({ message: "Organization created successfully.", organization: org });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const organizationId = req.params.id;

    if (!organizationId || Array.isArray(organizationId)) {
      return res.status(400).json({ message: "Organization ID is required." });
    }

    const input = updateOrganizationSchema.parse(req.body);
    const org = await updateOrganization(organizationId, input);
    res.status(200).json({ message: "Organization updated successfully.", organization: org });
  } catch (err) {
    next(err);
  }
}