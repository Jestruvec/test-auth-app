import { z } from "zod";

export const loginDataSchema = z.object({
  email: z
    .email({ message: "Enter a valid email address" })
    .min(1, "Email is required"),
  password: z.string({ message: "Password is required" }),
});

export type LoginDataInput = z.infer<typeof loginDataSchema>;
