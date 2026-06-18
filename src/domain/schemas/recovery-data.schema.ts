import { z } from "zod";

export const recoveryDataSchema = z.object({
  email: z
    .email({ message: "Enter a valid email address" })
    .min(1, "Email is required"),
});

export type RecoveryDataInput = z.infer<typeof recoveryDataSchema>;
