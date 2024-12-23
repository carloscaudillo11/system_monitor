import executeSSHCommand from "../lib/execute_command.js";
import System_info from "../models/system_info.model.js";
import IA_response from "../lib/IA_response.js";

const system_monitor = async (req, res) => {
  try {
    const { host, username, password, sshPort } = req.body;

    const commands = {
      memory: "free -m | awk 'NR==2{printf \"%.2f\", $3*100/$2 }'",
      disks: "df -h | awk 'NR>1 {print $1, $2, $3, $4, $5, $6}'",
      top_processes: "ps aux --sort=-%cpu | head -n 10",
      failed_services:
        "systemctl --failed --no-pager | grep -E '(failed|inactive)'",
      uptime: "uptime -p",
      errors: "journalctl -p 3 -b",
    };

    const otherResults = await Promise.all(
      Object.entries(commands).map(([key, command]) =>
        executeSSHCommand(host, username, password, sshPort, command).then(
          (output) => [key, output]
        )
      )
    );

    const stats = Object.fromEntries(otherResults);

    const diskList = stats.disks
      .split("\n")
      .map((line) => {
        const [filesystem, size, used, available, usage, mount_point] =
          line.split(/\s+/);
        return { filesystem, size, used, available, usage, mount_point };
      })
      .filter((disk) => disk.filesystem && !disk.filesystem.includes("tmpfs"));

    const sortedDisks = diskList.sort(
      (a, b) =>
        parseInt(b.usage.replace("%", "")) - parseInt(a.usage.replace("%", ""))
    );

    const cpuUsage = await executeSSHCommand(
      host,
      username,
      password,
      sshPort,
      "top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'"
    );

    const systemInfo = new System_info({
      cpu_usage: `${cpuUsage}%`,
      memory_usage: `${stats.memory}%`,
      important_disks: sortedDisks.slice(0, 3),
      top_processes: stats.top_processes.split("\n"),
      failed_services: stats.failed_services.split("\n"),
      uptime: stats.uptime,
      errors: stats.errors.split("\n"),
    });

    const savedSystemInfo = await systemInfo.save();

    res.json(savedSystemInfo);
  } catch (error) {
    res.status(500).json({ error });
  }
};

const getIAResponse = async (_req, res) => {
  try {
    const lastDocument = await System_info.findOne().sort({ createdAt: -1 });

    if (!lastDocument) {
      return res
        .status(404)
        .json({ error: "No se encontraron datos en el sistema." });
    }

    const apiRequestJson = {
      model: "llama3.1-8b",
      max_tokens: 1000,
      temperature: 0.5,
      top_p: 1.0,
      frequency_penalty: 1.0,
      messages: [
        {
          role: "system",
          content: "You are a expert assistant from infraestructure team.",
        },
        {
          role: "user",
          content: `Create a system monitor report detailed from this data: ${JSON.stringify(
            lastDocument
          )}`,
        },
      ],
      stream: false,
    };

    const { choices } = await IA_response(apiRequestJson);

    if (!choices || choices.length === 0) {
      return res
        .status(500)
        .json({ error: "La respuesta de la IA está vacía o es inválida." });
    }

    res.json({ content: choices[0].message.content });
  } catch (error) {
    console.error("Error en getIAResponse:", error);

    res.status(500).json({
      error: "Error al generar la respuesta de la IA.",
      details: error.message,
    });
  }
};

const getLastDocument = async (_req, res) => {
  try {
    const lastDocument = await System_info.findOne().sort({ createdAt: -1 });
    res.json(lastDocument);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export { system_monitor, getIAResponse, getLastDocument };
