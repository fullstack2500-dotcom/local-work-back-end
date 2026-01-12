import z from "zod";

export const RegisterSchema = z.object({
  name: z
      .string("Name must be a string")
      .min(3, "Name must have at least 3 characters")
      .max(50, "Name must have a maximum of 50 characters")
})