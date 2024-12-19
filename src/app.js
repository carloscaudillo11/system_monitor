import express from "express";
import cors from "cors";
import morgan from "morgan";
import system_monitor_routes from "./routes/system_monitor.route.js";

const app = express();

//app.use(cors());

app.use(morgan("dev"));
app.use(express.json());
app.use(system_monitor_routes);


export default app;
