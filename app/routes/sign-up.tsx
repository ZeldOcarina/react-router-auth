import { GalleryVerticalEnd } from "lucide-react";
import {
  data,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSubmit,
  type ActionFunction,
  type LoaderFunction,
} from "react-router";
import { SmallAppLogo } from "~/components/AppLogo";
import { SignUpForm } from "~/components/auth/SignUpForm";
import { signUpFormSchema, type SignUpFormSchema } from "~/models/User";

import type { Route } from "../+types/root";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { FieldErrors } from "react-hook-form";
import { signup, AuthError } from "~/data/auth.server";
import { render } from "@react-email/render";
import VerifyOTPEmail from "~/emails/monarchy-verify-otp";
import { sendEmail } from "~/utils/sendEmail.server";
import { generateGoogleAuthUrl } from "~/data/google.server";

export default function SignUpPage({}: Route.ComponentProps) {
  const {
    data: { googleAuthUrl, error },
  } = useLoaderData();

  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = useState<
    FieldErrors<SignUpFormSchema> | undefined
  >(undefined);

  async function onSubmit(data: SignUpFormSchema): Promise<void> {
    fetcher.submit(data, {
      encType: "application/json",
      method: "POST",
      action: ".",
    });
  }

  useEffect(() => {
    if (!error) return;
    console.log(error);

    setTimeout(() => {
      toast.error("Error", { description: error });
    }, 0);
  }, [error]);

  useEffect(() => {
    if (!fetcher.data) return;

    if (fetcher.data.status === 201) {
      toast.success("Success", { description: fetcher.data.data });
      setTimeout(() => {
        navigate("/activate-account");
      }, 500);
    }
    if (
      fetcher.data.status === 400 &&
      fetcher.data.data &&
      fetcher.data.data.fieldErrors
    ) {
      setServerErrors(fetcher.data.data.fieldErrors);
    }
    if (fetcher.data.status === 422 && typeof fetcher.data.data === "string") {
      toast.error("Error", { description: fetcher.data.data });
    }
  }, [fetcher.data]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex justify-center items-center gap-4 flex-col">
          <SmallAppLogo className="w-14" />
          Monarchy HIPAA Connector
        </div>
        <SignUpForm
          onSubmit={onSubmit}
          serverErrors={serverErrors}
          googleAuthUrl={googleAuthUrl}
        />
      </div>
    </div>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const error = searchParams.get("error");

  return {
    status: 200,
    data: {
      googleAuthUrl: generateGoogleAuthUrl("sign-up"),
      error,
    },
  };
};

export const action: ActionFunction = async ({ request }) => {
  const jsonRequest = await request.json();
  const validatedData = signUpFormSchema.safeParse(jsonRequest);

  if (!validatedData.success) {
    const fieldErrors: FieldErrors<SignUpFormSchema> = {};

    const zodFieldErrors = validatedData.error.formErrors.fieldErrors;
    Object.entries(zodFieldErrors).forEach(([field, errors]) => {
      if (errors && errors.length > 0) {
        fieldErrors[field as keyof SignUpFormSchema] = {
          type: "server",
          message: errors[0],
        };
      }
    });

    return data(
      {
        status: 400,
        data: { fieldErrors },
      },
      { status: 400 }
    );
  }

  try {
    const user = await signup(validatedData.data);

    const html = await render(
      <VerifyOTPEmail validationCode={user.activationCode!} />,
      {
        pretty: true,
      }
    );

    await sendEmail({
      from: "service-connector@monarchy.io",
      subject: "Your OTP code",
      to: user.email,
      html,
      text: html,
    });

    return data(
      { status: 201, data: "user successfully signed up" },
      { status: 201 }
    );
  } catch (err) {
    console.log(err);

    if (err instanceof AuthError) {
      return data(
        {
          status: err.status,
          data: err.message,
        },
        { status: err.status }
      );
    }
  }
};
