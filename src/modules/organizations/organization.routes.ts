import { Router } from "express";
import { create, update } from "./organization.controller";
import { authenticate } from "../../middleware/authenticate";
import { requireOrgRole } from "../../middleware/require-org-role";

const router = Router();

router.post("/", authenticate, create);
router.patch("/:id", authenticate, requireOrgRole(["owner", "admin"]), update);

export default router;