import mongoose from "mongoose";

const DiskSchema = new mongoose.Schema({
    filesystem: { type: String, required: true },
    size: { type: String, required: true },
    used: { type: String, required: true },
    available: { type: String, required: true },
    usage: { type: String, required: true },
    mount_point: { type: String, required: true },
});

const SystemInfoSchema = new mongoose.Schema(
  {
    cpu_usage: { type: String, required: true },
    memory_usage: { type: String, required: true },
    important_disks: { type: [DiskSchema], required: true },
    top_processes: { type: [String], required: true },
    failed_services: { type: [String], required: true },
    uptime: { type: String, required: true },
    system_errors: { type: [String], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("SystemInfo", SystemInfoSchema);
