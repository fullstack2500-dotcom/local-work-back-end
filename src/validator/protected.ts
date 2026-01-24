import z from "zod";


// Job Schema:
export const JobSchema = z.object({
  title: z
          .string("Title must be a string")
          .min(3, "Title must have at least 3 characters")
          .max(120, "Title shouldn't exceed 120 characters"),
  description: z
          .string("Description must be a string")
          .min(20, "Description must have at least 20 charcters")
          .max(20000, "Description shouldn't exceed 20,000 characters"),
  postedBy: z.string("postedBy must be a string"),
  location: z.string("Location must be a string"),
  salaryPerDay: z
          .number("Salary per day must be a number")
          .min(500, "Salary must have a minimum of 500 per day")
          .max(3000, "Salary shouldn't exceed 3000 pesos per day"),
  hours: z
          .number("Hours per week must be a number")
          .min(30, "Hours per week should be at least 30")
          .max(40, "Hours per week shouldn't be more than 40"),
  type: z.enum(["Part Time", "Full Time"], "Type must be either Part Time, Full Time").optional(),
  status: z.enum(["ongoing", "approved"], "Status must be either ongoing, approved").optional(),
  review: z.string("Review must be a string").min(1, "Review must have at least 1 character").max(2000, "Review shouldn't exceed 2,000"),
  
  isAvailable: z.boolean("isAvailable must be a boolean: true or false").optional()
})
