import z from "zod";

// https://zod.dev/api - Documentation:
// Total Workers, Verified Workers, Pending Verification, Report Accounts

export const TotalWorkerSchema = z.object({
  role: z.literal("worker", "Role must be a worker")
})

export const VerifiedWorkersSchema = z.object({
  role: z.literal("worker", "Role must be a worker"),
  status: z.literal("verified", "Role must be verified")
})

export const PendingVerificationWorkersSchema = z.object({
  role: z.literal("worker", "Role must be a worker"),
  status: z.literal("pending", "Role must be pending")
})