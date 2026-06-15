import { z } from "zod";

export const registerDataSchema = z.object({
  email: z
    .email({ message: "Email es requerido" })
    .min(1, "Email es requerido"),
  password: z
    .string({ message: "Contraseña es requerida" })
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Debe contener al menos un carácter especial"
    ),
  firstName: z
    .string({ message: "Nombre es requerido" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  lastName: z
    .string({ message: "Apellido es requerido" })
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres"),
});

export type RegisterDataInput = z.infer<typeof registerDataSchema>;
