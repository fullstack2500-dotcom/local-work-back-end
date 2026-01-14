import z from "zod";

// https://zod.dev/api - Documentation:
// Total Workers, Verified Workers, Pending Verification, Report Accounts

export const TotalWorkerSchema = z.object({
  role: z.enum(["worker"], "Role must be worker")
})

export const VerifiedWorkersSchema = z.object({
  role: z.enum(["worker"], "Role must be a worker"),
  status: z.enum(["verified"], "Role must be verified")
})

export const PendingVerificationWorkersSchema = z.object({
  role: z.enum(["worker"], "Role must be a worker"),
  status: z.enum(["pending"], "Role must be pending")
})