import executeSSHCommand from "../lib/execute_command.js";

const system_monitor = async (req, res) => {
  try {
    const { host, username, password, sshPort } = req.body;

    const commands = {
      cpu: "top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'",
      memory: "free -m | awk 'NR==2{printf \"%.2f\", $3*100/$2 }'",
      disks: "df -h | awk 'NR>1 {print $1, $2, $3, $4, $5, $6}'",
      top_processes: "ps aux --sort=-%cpu | head -n 5",
      failed_services:
        "systemctl --failed --no-pager | grep -E '(failed|inactive)'",
      uptime: "uptime -p",
      network: "ip -s link",
      connections: "netstat -tuln",
      swap: "free -m | grep Swap | awk '{print $3 \"/\" $2}'",
      errors: "journalctl -p 3 -b",
    };

    const results = await Promise.all(
      Object.entries(commands).map(([key, command]) =>
        executeSSHCommand(host, username, password, sshPort, command).then(
          (output) => [key, output]
        )
      )
    );

    // Procesar los resultados en un objeto
    const stats = Object.fromEntries(results);

    // Procesar discos
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

    // Respuesta final
    res.json({
      cpu_usage: `${stats.cpu}%`,
      memory_usage: `${stats.memory}%`,
      important_disks: sortedDisks.slice(0, 3),
      top_processes: stats.top_processes.split("\n"),
      failed_services: stats.failed_services.split("\n"),
      uptime: stats.uptime,
      network: stats.network.split("\n"),
      connections: stats.connections.split("\n"),
      swap_usage: stats.swap,
      errors: stats.errors.split("\n"),
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default system_monitor;
