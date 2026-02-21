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
  status: z.enum(["accepted", "declined"], "Status must be either accepted or declined")
})


