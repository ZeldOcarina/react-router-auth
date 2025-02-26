import {
  frontendUserSchema,
  type EditUserFormSchema,
  type FrontendUserSchema,
  type LoginFormSchema,
  type SignUpFormSchema,
} from "~/models/User";
import User from "~/models/User";
import { compare, hash } from "bcryptjs";
import {
  generateCodeExpiration,
  generateSixDigitsCode,
} from "~/utils/utils.server";
import { authSessionStorage } from "~/sessions.server";
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { sendEmail } from "~/utils/sendEmail.server";

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function createUserSession(userId: string) {
  const session = await authSessionStorage.getSession();
  session.set("userId", userId);
  return session;

  // consumed with:

  // return redirect(redirectPath, {
  //   headers: {
  //     "Set-Cookie": await authSessionStorage.commitSession(session),
  //   },
  // });
}

export async function getUserFromSession(
  request: LoaderFunctionArgs["request"]
) {
  const session = await authSessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const userId = session.get("userId");

  if (!userId) {
    return null;
  }

  return userId;
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

  const passwordHash = password ? await hash(password, 12) : null;

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

  const passwordCorrect = password
    ? await compare(password, existingUser.password)
    : false;

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

  const isOtpValid = !!existingUser;

  if (isOtpValid) {
    existingUser.activationCode = "";
    existingUser.activationCodeExpiration = undefined;
    existingUser.isActive = true;

    await existingUser.save();
  }

  return { isOtpValid, user: existingUser };
}

export async function getFrontendUserById(
  id: string
): Promise<FrontendUserSchema | null> {
  const user = await User.findById(id);

  if (!user) return null;

  const parsedData = frontendUserSchema.safeParse({
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  });

  if (!parsedData.success) {
    throw new AuthError(500, "malformed user");
  }

  return parsedData.data;
}

export async function destroyUserSession(
  request: ActionFunctionArgs["request"]
) {
  const session = await authSessionStorage.getSession(
    request.headers.get("Cookie")
  );
  const newCookie = await authSessionStorage.destroySession(session);
  return newCookie;
}

export async function getAllUsers(): Promise<FrontendUserSchema[]> {
  const users = await User.find();

  const frontendUsers = users.map((user) => {
    return {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      id: user.id,
      role: user.role,
      googleSub: user.googleSub,
    };
  });

  const parsedFrontendUsers = frontendUsers.filter(
    (item) => frontendUserSchema.safeParse(item).success
  );

  return parsedFrontendUsers;
}

export async function updateUser(id: string, data: EditUserFormSchema) {
  const user = await User.findById(id);

  if (!user) throw new AuthError(404, "a user with this id could not be found");

  if (data.email) user.email = data.email;
  if (data.firstName) user.firstName = data.firstName;
  if (data.lastName) user.lastName = data.lastName;
  if (data.role) user.role = data.role;

  await user.save();
}
