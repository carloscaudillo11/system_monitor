import { Router } from "express";
import { getIAResponse, system_monitor, getLastDocument } from "../controllers/system_monitor.controller.js";
import validateSchema from "../middlewares/validator.middleware.js";
import serverSchema from "../schemas/server.schema.js";

const router = Router();

router.get("/", (req, res) => res.send("System Monitor"));
router.post("/monitor_linux", validateSchema(serverSchema), system_monitor);
router.get("/ia_response", getIAResponse);
router.get("/last_document", getLastDocument);

export default router;