import { type LoginFormSchema, type SignUpFormSchema } from "~/models/User";
import User from "~/models/User";
import { compare, hash } from "bcryptjs";
import {
  generateCodeExpiration,
  generateSixDigitsCode,
} from "~/utils/utils.server";
import { authSessionStorage } from "~/sessions.server";
import { redirect } from "react-router";
import { sendEmail } from "~/utils/sendEmail.server";

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function createUserSession(userId: string, redirectPath: string) {
  const session = await authSessionStorage.getSession();
  session.set("userId", userId);
  return session;
  // return redirect(redirectPath, {
  //   headers: {
  //     "Set-Cookie": await authSessionStorage.commitSession(session),
  //   },
  // });
}

export async function signup({
  firstName,
  lastName,
  email,
  password,
}: SignUpFormSchema) {
  const existingUser = await User.findByEmail(email);

  if (existingUser) {
    throw new AuthError(422, "a user with this email already exists");
  }

  const passwordHash = await hash(password, 12);

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: passwordHash,
    activationCode: generateSixDigitsCode(),
    activationCodeExpiration: generateCodeExpiration(),
  });

  return newUser;
}

export async function generateLoginRequest({
  email,
  password,
}: LoginFormSchema) {
  const existingUser = await User.findByEmail(email);

  if (!existingUser) {
    throw new AuthError(
      401,
      "We could not find a user with the provided email."
    );
  }

  const passwordCorrect = await compare(password, existingUser.password);

  if (!passwordCorrect) {
    throw new AuthError(401, "Invalid password");
  }

  existingUser.activationCode = generateSixDigitsCode();
  existingUser.activationCodeExpiration = generateCodeExpiration();

  await existingUser.save();

  return existingUser;
}

export async function verifyOtp(otp: string) {
  const existingUser = await User.findOne({
    activationCode: otp,
    activationCodeExpiration: { $gt: new Date() },
  });

  return !!existingUser;
}
