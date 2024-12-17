import { z } from "zod";

// Schema de validación para la configuración SSH
const serverSchema = z.object({
  host: z
    .string({
      required_error: "La dirección del host es requerida",
      invalid_type_error: "El host debe ser una cadena de texto",
    })
    .ip({ version: "v4", message: "El host debe ser una dirección IP válida (IPv4)" }),

  username: z
    .string({
      required_error: "El nombre de usuario es requerido",
      invalid_type_error: "El nombre de usuario debe ser una cadena de texto",
    })
    .min(1, { message: "El nombre de usuario no puede estar vacío" }),

  password: z
    .string({
      required_error: "La contraseña es requerida",
      invalid_type_error: "La contraseña debe ser una cadena de texto",
    })
    .min(1, { message: "La contraseña no puede estar vacía" }),

  sshPort: z
    .number({
      required_error: "El puerto SSH es requerido",
      invalid_type_error: "El puerto SSH debe ser un número",
    })
    .int({ message: "El puerto SSH debe ser un número entero" })
    .min(1, { message: "El puerto SSH debe ser mayor que 0" })
    .max(65535, { message: "El puerto SSH debe ser menor o igual a 65535" }),
});

export default serverSchema;

