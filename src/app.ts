import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/error-handler";
import organizationRoutes from "./modules/organizations/organization.routes";
import projectRoutes from "./modules/projects/project.routes";
import memberRoutes from "./modules/members/member.routes";


const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api", projectRoutes);
app.use("/api", memberRoutes);


app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));