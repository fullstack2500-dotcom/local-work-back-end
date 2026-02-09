import z from "zod";


// Job Schema:
export const JobSchema = z.object({
  title: z
          .string("Job must be a string")
          .min(3, "Title must have at least 3 characters")
          .max(60, "Title shouldn't exceed 60 characters"),
  companyName: z.string("Company Name must be a string"),
  company: z.string("Company should be a string").optional(),
  postedBy: z.string("Posted By must be the string of the user ID"),
  location: z.string("Location must be a string").optional(),
  locationName: z.string("Location Name should be a string"),
  type: z.enum(["Part-Time", "Full-Time"], "Type must be Part-Time | Full-Time").optional(),
  salaryRangeMin: z
          .int("Salary Range Min must be an integer")
          .min(200, "Salary Range Min must be at least Php 200.00")
          .max(2000, "Salary per day shouldn't exceed Php 1,000.00"),
  salaryRangeMax: z
          .int("Salary Range Max must be an integer")
          .min(250, "Salary Range Max must be at least Php 250.00")
          .max(5000, "Salary Range Max shouldn't exceed Php 2,000.00"),
  hoursNeeded: z
          .int("Hours Per Week must be an integer")
          .min(30, "Hours Per Week must be at least 30")
          .max(40, "Hours Per Week must be 40 at most"),
  description: z
          .string("Description must be a string")
          .min(50, "Description must be at least 50 characters")
          .max(900, "Description shouldn't exceed 900 characters")
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
export const AppSchema = z.object({
  job: z.string("Job must be a string"),
  worker: z.string("Worker must be a string"),
  role: z.enum(["worker"], "Workers Only!"),
  subject: z
            .string("Subject must be a string")
            .min(3, "Subject must have at least 3 characters")
            .max(50, "Subject shouldn't exceed 50 characters"),
  message: z
            .string("Message must be a string")
            .min(20, "Message must have at least 20 characters")
            .max(500, "Message shouldn't exceed 500 characters"),
  contact: z
            .string("Contact Details must be a string")
            .min(11, "Contact Details must have at least 11 characters")
            .max(50, "Contact Details shouldn't exceed 50 characters")
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


// Add Skill:
export const SkillSchema = z.object({
  title: z.string("Title must be a string"),
  job: z.string("Job must be a string")
})