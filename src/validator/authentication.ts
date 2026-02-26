import z from "zod";

// Register the Admin:
export const AdminSchema = z.object({
  name: z
      .string("Name must be a string")
      .min(3, "Name must have at least 3 characters")
      .max(35, "Name must have a maximum of 35 characters")
      .regex(/^[A-Za-z0-9 ]*$/, "Name must only include letters, digits, and spaces"),
  email: z
      .string("Email must be a string")
      .email("Email must be a valid email"),
  password: z
      .string("Password should be a string")
      .min(6, "Password must have at least 6 characters")
      .max(16, "Password shouldn't exceed 16 characters")
      .regex(
        // Source - https://stackoverflow.com/a/21456918
        // Posted by Srinivas, modified by community. See post 'Timeline' for change history
        // Retrieved 2026-02-09, License - CC BY-SA 4.0

      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,16}$/,
      "Password must contain at least one character, one digit, and one special character"
      ),
  role: z
      .enum(["admin"], "Role must be admin only")
      .optional(),
  avatar: z
      .string("Avatar must be a string")
      .optional()
})








// Admin Login:
export const AdminLoginSchema = z.object({
  email: z.string("Email must be a string").email("Email must be a valid email"),
  password: z.string("Password must be a string")
})








// Register User Schema:
export const WorkerRegisterSchema = z.object({
  // Name validation:
  name: z
      .string("Name must be a string")
      .min(3, "Name must have at least 3 characters")
      .max(35, "Name must have a maximum of 35 characters")
      .regex(/^[A-Za-z0-9 ]*$/, "Name must only include letters, digits, and spaces"), // https://www.servicenow.com/community/itsm-forum/allow-only-alphanumeric-values-and-special-characters/td-p/712231
  
  // Email validation:
  email: z
      .string("Email must be a string")
      .email("Email must be a valid email"),

  // Password validation:
  password: z
      .string("Password must be a string")
      .min(6, "Password must have at least 6 characters")
      .max(16, "Password must have a maximum of 16 characters")
      .regex(
        // Source - https://stackoverflow.com/a/21456918
        // Posted by Srinivas, modified by community. See post 'Timeline' for change history
        // Retrieved 2026-02-09, License - CC BY-SA 4.0

      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,16}$/,
      "Password must contain at least one character, one digit, and one special character"
      ),

  // Phone Number Validation:
  // Link for regex: https://stackoverflow.com/questions/31175221/regex-pattern-for-philippine-phone-number:
  phoneNumber: z
      .string("Phone Number must be a string")
      .regex(/^(\+639)\d{9}$/, "Please enter a valid phone number, ex. +639..."),

  skill: z.string("Skill must be a string"),

  

  // Source - https://stackoverflow.com/q
  // Posted by user19910212, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-01-12, License - CC BY-SA 4.0
  // To ensure correct usage of .optional() - https://joodi.medium.com/understanding-zod-schema-validation-with-optional-fields-db4f982f8cec
  role: z.enum(["worker", "employer", "admin"], "Role must be either worker, employer, admin").optional(),
  photo: z.string("Photo must be the string URL").optional(),
  resume: z.string("Resume must be the string URL").optional(),
  status: z.enum(["pending", "verified"], "Status must be either pending or verified").optional()
})





// Employer Schema:
export const EmployerSchema = z.object({
  company: z.string("Company must be a string").regex(/^[A-Za-z0-9 ]*$/, "Company should only include letters, digits, and spaces"),
  email: z.string("Email must be a string").email("Email must be a valid email"),
  password: z
  .string("Password must be a string")
      .min(6, "Password must have at least 6 characters")
      .max(16, "Password must have a maximum of 16 characters")
      .regex(
        // Source - https://stackoverflow.com/a/21456918
        // Posted by Srinivas, modified by community. See post 'Timeline' for change history
        // Retrieved 2026-02-09, License - CC BY-SA 4.0

      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,16}$/,
      "Password must contain at least one character, one digit, and one special character"
      ),
  phone: z.string("Phone Number must be a string").regex(/^(\+639)\d{9}$/, "Please enter a valid phone number, ex. +639..."),
  industry: z.string("Industry must be a string").regex(/^[A-Za-z0-9 ]*$/, "Company should only include letters, digits, and spaces"),
  permit: z.string("Permit must be the URL string").optional()
})




// Login Schema:
export const LoginSchema = z.object({
  email: z.string("Email must be a string").email("Email must be a valid email"),
  password: z.string("Password must be a string"),
  role: z.enum(["worker", "employer", "admin"], "Role must be worker, employer, admin.")
})



// User Schema:
export const UserSchema = z.object({
  user: z.string("User ID must be a string")
})



// Totak Workers Schema for Non-Admins:
export const TotalWorkerSchemaMain = z.object({
  role: z.enum(["worker"], "Role must be worker")
})