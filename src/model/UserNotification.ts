import { Document, model, Schema, Types } from "mongoose";

export interface IUserNotification extends Document {
  type: "job_posted" | "application" | "verification" | "contact" | "report";

  title: string;
  description: string;
  read: boolean;

  category: "job" | "contact" | "account";

  // targeting
  audience: "all" | "workers" | "employers" | "specific";

  targetUsers?: Types.ObjectId[];

  details?: string;
  createdAt: Date;
}

const UserNotificationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["job_posted", "application", "verification", "contact", "report"],
      required: true,
    },

    title: String,
    description: String,

    read: {
      type: Boolean,
      default: false
    },

    audience: {
      type: String,
      enum: ["all", "workers", "employers", "specific"],
      required: true,
    },

    targetUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    category: {
      type: String,
      enum: ["job", "contact", "account"],
      required: true,
    },

    details: String,
  },
  {
    timestamps: true,
  }
);

export default model<IUserNotification>(
  "UserNotification",
  UserNotificationSchema
);