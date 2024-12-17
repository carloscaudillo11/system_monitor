import { Router } from "express";
import system_monitor from "../controllers/system_monitor.controller.js";
import validateSchema from "../middlewares/validator.middleware.js";
import serverSchema from "../schemas/server.schema.js";

const router = Router();

router.post("/monitor_linux", validateSchema(serverSchema), system_monitor);

export default router;