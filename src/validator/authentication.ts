import z from "zod";

// Register User Schema:
export const RegisterSchema = z.object({
  // Name validation:
  name: z
      .string("Name must be a string")
      .min(3, "Name must have at least 3 characters")
      .max(50, "Name must have a maximum of 50 characters")
      .regex(/^[A-Za-z0-9_]*$/, "Name must only include letters, digits, and underscores"), // https://www.servicenow.com/community/itsm-forum/allow-only-alphanumeric-values-and-special-characters/td-p/712231

  // Email validation:
  email: z
      .string("Email must be a string")
      .email("Email must be a valid email"),

  // Password validation:
  password: z
      .string("Password must be a string")
      .min(6, "Password must have at least 6 characters")
      .max(16, "Password must have a maximum of 16 characters")

      // Source - https://stackoverflow.com/a
      // Posted by Srinivas, modified by community. See post 'Timeline' for change history
      // Retrieved 2026-01-12, License - CC BY-SA 4.0

      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@!%*#?&])[A-Za-z_\d@!%*#?&]{6,16}$/,
        "Password must have one letter, one digit, and one special character"
      ),

  // Source - https://stackoverflow.com/q
  // Posted by user19910212, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-01-12, License - CC BY-SA 4.0
  // To ensure correct usage of .optional() - https://joodi.medium.com/understanding-zod-schema-validation-with-optional-fields-db4f982f8cec
  role: z.enum(["worker", "employer", "admin"], "Role must be either worker, employer, admin").optional(),
  supabaseId: z.uuidv4("Supabase must be a valid uuidv4")
})




// Login Schema:
export const LoginSchema = z.object({
  email: z.string("Email must be a string").email("Email must be a valid email"),
  password: z.string("Password must be a string")
})



// User Schema:
export const UserSchema = z.object({
  user: z.instanceof(Object)

  // This simply checks that the value passed into the id property is an intance of the ObjectID class. 
  // Docs are at https://github.com/colinhacks/zod#instanceof
})



// Totak Workers Schema for Non-Admins:
export const TotalWorkerSchemaMain = z.object({
  role: z.enum(["worker"], "Role must be worker")
})