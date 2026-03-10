import z from "zod";

// https://zod.dev/api - Documentation:
// Total Workers, Verified Workers, Pending Verification, Report Accounts

export const TotalWorkerSchema = z.object({
  role: z.enum(["worker"], "Role must be worker")
})

export const PendingSchema = z.object({
  status: z.enum(["pending"], "Status must be pending")
})

export const AcceptedSchema = z.object({
  status: z.enum(["accepted"], "Status must be accepted")
})

export const DeclinedSchema = z.object({
  status: z.enum(["declined"], "Status must be declined")
})

export const VerifiedWorkersSchema = z.object({
  status: z.enum(["verified"], "Role must be verified")
})

export const PendingVerificationWorkersSchema = z.object({
  status: z.enum(["pending"], "Role must be pending")
})


export const DeclinedWorkersSchema = z.object({
  status: z.enum(["declined"], "Role must be declined")
})




// Accept the admin to add skill:
export const NewSkillSchema = z.object({
  title: z.string("Title must be a string").regex(/^[A-Za-z ]*$/, "Name must only include letters and spaces")
})

// Accept the Application Status:
export const AppStatusSchema = z.object({
  status_PR: z.enum(["Pending Review"], "Status_0 must be Pending Review"),
  status_IS: z.enum(["Interview Scheduled"], "Status_1 must be Interview Scheduled"),
  status_AC: z.enum(["Accepted"], "Status_2 must be Accepted"),
  status_NS: z.enum(["Not Selected"], "Status_3 must be Not Selected")
})


// Update Job Status:
export const UpdateSchema = z.object({
  id: z.string("Job ID must be a string"),
  status: z.enum(["ACCEPTED", "DECLINED"], "Status must be either accepted or declined")
})


// Add New Company:
export const AddNewCompanySchema = z.object({
  title: z.string("Title must be a string").min(2, "Title must have at least 2 characters").max(50, "Title must not exceed 50 characters"),
  industry: z.string("Industry must be a string"),
  location: z.string("Location must be a string"),
  description: z.string("Description must be a string").min(20, "Description must have at least 20 characters").max(500, "Description must not exceed 500 characters"),
  noOfEmployees: z.int("Number of Employees must be a number").min(1, "Value should not be < 1").optional(),
  openPositions: z.int("Open Positions must be a Number").min(1, "Value should not be < 1").optional(),
  website: z.string("Website must be a string").url("Website must be a valid URL format").optional(),
  totalApplications: z.int("Total Applications must be a number").optional(),
  companyOwner: z.string("Company Owner must be a string")
})

// Add New Industry:
export const AddNewIndustryValidation = z.object({
  title: z.string("Title must be a string").min(1, "Title must have at least 1 character").max(50, "Title must not exceed 50 characters")
})