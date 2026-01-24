import z from "zod";


// Requirements:
export const RequirementSchema = z.object({
  requirement: z.string("Requirement must be a string")
})

// Users:
export const Users = z.object({
  user: z.instanceof(Object)
})




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
  postedBy: z.instanceof(Object),

  // This simply checks that the value passed into the id property is an intance of the ObjectID class. 
  // Docs are at https://github.com/colinhacks/zod#instanceof


// Source - https://stackoverflow.com/a
// Posted by Ark, modified by community. See post 'Timeline' for change history
// Retrieved 2026-01-24, License - CC BY-SA 4.0
  requirements: z.array(RequirementSchema),
  rating: z.number("Rating must be a number"),
  location: z.instanceof(Object),
  salaryPerDay: z
          .number("Salary per day must be a number")
          .min(500, "Salary must have a minimum of 500 per day")
          .max(3000, "Salary shouldn't exceed 3000 pesos per day"),
  hours: z
          .number("Hours per week must be a number")
          .min(30, "Hours per week should be at least 30")
          .max(40, "Hours per week shouldn't be more than 40"),
  type: z.enum(["Part Time", "Full Time"], "Type must be either Part Time, Full Time"),
  status: z.enum(["ongoing", "approved"], "Status must be either ongoing, approved"),
  isAvailable: z.boolean("isAvailable must be a boolean: true or false"),
  accepted: z.array(Users),
  pending: z.array(Users),
  saved: z.array(Users)
})
