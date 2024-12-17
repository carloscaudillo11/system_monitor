import { Client } from "ssh2";

const executeSSHCommand = async (host, username, password, port, command) => {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on("ready", () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            return reject(`Error ejecutando comando: ${err.message}`);
          }

          let result = "";
          stream
            .on("data", (data) => {
              result += data.toString();
            })
            .on("close", () => {
              conn.end();
              resolve(result.trim());
            });
        });
      })
      .on("error", (err) => reject(`Error de conexión SSH: ${err.message}`))
      .connect({
        host,
        port,
        username,
        password,
      });
  });
};

export default executeSSHCommand;
