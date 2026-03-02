import z from "zod";


// Job Schema:
export const JobSchema = z.object({
  title: z
          .string("Job must be a string")
          .min(3, "Title must have at least 3 characters")
          .max(60, "Title shouldn't exceed 60 characters"),
  company: z.string("Company must be a string"),
  posted: z.string("Posted By must be the string of the user ID"),
  location: z.string("Location must be a string"),
  type: z.enum(["Part-Time", "Full-Time", "Contract", "Temporary"], "Type must be Part-Time | Full-Time").optional(),
  salary: z.string("Salary must be a string"),
  description: z
          .string("Description must be a string")
          .min(50, "Description must be at least 50 characters")
          .max(900, "Description shouldn't exceed 900 characters"),
  tags: z.array(
    z.string("Tag must be a string"),
    "Tags must be an array"
  ),
  requirements: z.array(
    z.string("Requirement must be a string"),
    "Requirements must be an array"
  ),
  benefits: z.array(
    z.string("Benefits must be a string"),
    "Benefits must be an array"
  ),
  schedule: z.string("Schedule must be a string"),
  startDate: z.string("Please enter a date").optional(),
  positions: z.int("Positions must be an integer").optional(),
  applyBefore: z.string("Apply Before must be a string").optional(),
  email: z.string("Contact Email must be a string").email("Contact Email must be a valid email"),
  phone: z.string("Contact Phone must be a string").regex(/^(\+639)\d{9}$/, "Please enter a valid phone number, ex. +639...")
})


// Company Schema:
export const CompanySchema = z.object({
  title: z.string("Title must be a string")
})



// Job Overview Schema:
export const JobOverviewSchema = z.object({
  job: z.string("Job ID must be a string")
})



// Application Schema:
export const ApplicationSchema = z.object({
  job: z.string("Job must be the ObjectId String"),
  worker: z.string("Worker ID must be an ObjectId")
})



// Company Schema:
export const Company_IDSchema = z.object({
  Company_ID: z.string("Company ID must be a string"),
})

// Location Schema:
export const Location_IDSchema = z.object({
  Location_ID: z.string("Company ID must be a string"),
})




// Add Location:
export const LocationSchema = z.object({
  name: z.string("Title must be a string")
})


// Add Worker ID:
export const ViewProfile = z.object({
  id: z.string("Worker ID must be a string"),
  role: z.enum(["worker", "employer"], "Role must be worker / employer")
})


// Add Employer ID:
export const employerIdSchema = z.object({
  id: z.string("Employer ID must be a string"),
  role: z.enum(["employer"], "Role must be employer")
})


// Add Skill:
export const TagSchema = z.object({
  title: z.string("Title must be a string")
})