import z from "zod";


// Job Schema:
export const JobSchema = z.object({
  title: z
          .string("Job must be a string")
          .min(3, "Title must have at least 3 characters")
          .max(60, "Title shouldn't exceed 60 characters"),
  postedBy: z.string("Posted by must be a string"),
  type: z.enum(["Part Time", "Full Time"], "Type must be Part Time | Full Time").optional(),
  salaryPerDay: z
          .int("Salary Per Day must be an integer")
          .min(240, "Salary per day must be at least Php 240.00")
          .max(1200, "Salary per day shouldn't exceed Php 1200.00"),
  hoursNeeded: z
          .int("Hours Per Week must be an integer")
          .min(30, "Hours Per Week must be at least 30")
          .max(40, "Hours Per Week must be 40 at most"),
  description: z
          .string("Description must be a string")
          .min(50, "Description must be at least 50 characters")
          .max(900, "Description shouldn't exceed 900 characters")
})
