import z from "zod";

export const JobSchema = z.object({
  title: z
          .string("Title must be a string")
          .min(3, "Title must have at least 3 characters")
          .max(120, "Title shouldn't exceed 120 characters"),
  description: z
          .string("Description must be a string")
          .min(20, "Description must have at least 20 charcters")
          .max(20000, "Description shouldn't exceed 20,000 characters"),
  postedBy: z.instanceof(Object)
})