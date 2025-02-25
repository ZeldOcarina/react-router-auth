import { Model, Schema, model, models, Document } from "mongoose";
import { z } from "zod";

export enum UserRole {
  NONE = "none",
  USER = "user",
  ADMIN = "admin",
}

const monarchyEmailSchema = z
  .string()
  .email("Invalid email address")
  .refine((email) => email.endsWith("monarchy.io"), {
    message: "Email must be a valid monarchy.io email address",
  });

export const zodUserSchema = z.object({
  email: monarchyEmailSchema,
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  googleSub: z.string().optional(),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  isActive: z.boolean().default(true),
  role: z.nativeEnum(UserRole).default(UserRole.NONE),
});

export const loginFormSchema = zodUserSchema.pick({
  email: true,
  password: true,
});

export const signUpFormSchema = zodUserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
});

export const activateAccountFormSchema = z
  .string()
  .length(6, { message: "The otp must be six characters long" });

export const frontendUserSchema = zodUserSchema
  .extend({ id: z.string() })
  .pick({
    email: true,
    firstName: true,
    lastName: true,
    role: true,
    id: true,
  });

export type SignUpFormSchema = z.infer<typeof signUpFormSchema>;
export type LoginFormSchema = z.infer<typeof loginFormSchema>;
export type FrontendUserSchema = z.infer<typeof frontendUserSchema>;

// Define the User interface with all fields
export interface IUser {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  role: string;
  activationCode?: string;
  activationCodeExpiration?: Date;
  createdAt: Date;
  updatedAt: Date;
  googleSub?: string;
}

// Create a User Document type that includes Mongoose document methods
export interface UserDocument extends IUser, Document {}

// Define model interface with static methods
export interface UserModel extends Model<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
}

// Define the schema
const userSchema = new Schema<UserDocument, UserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => {
          return monarchyEmailSchema.safeParse(v).success;
        },
        message: "Email must be a valid monarchy.io email address",
      },
    },
    password: {
      type: String,
      minlength: 6,
    },
    googleSub: String,
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.NONE,
    },
    activationCode: {
      type: String,
      required: false,
    },
    activationCodeExpiration: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add the static method to the schema
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email });
};

// Create the model with proper typing
const User =
  (models?.User as UserModel) ||
  model<UserDocument, UserModel>("User", userSchema);

export default User;
