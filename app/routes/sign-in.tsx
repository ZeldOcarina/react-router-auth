import { render } from "@react-email/render";
import { useEffect, useState } from "react";
import { type FieldErrors } from "react-hook-form";
import {
  useFetcher,
  useNavigate,
  data,
  type ActionFunction,
  type LoaderFunction,
  useLoaderData,
} from "react-router";
import { toast } from "sonner";
import { SmallAppLogo } from "~/components/AppLogo";
import { LoginForm } from "~/components/auth/LoginForm";
import { AuthError, generateLoginRequest } from "~/data/auth.server";
import { generateGoogleAuthUrl } from "~/data/google.server";
import VerifyOTPEmail from "~/emails/monarchy-verify-otp";

import { loginFormSchema, type LoginFormSchema } from "~/models/User";
import { sendEmail } from "~/utils/sendEmail.server";

export default function LoginPage() {
  const {
    data: { googleAuthUrl, error },
  } = useLoaderData();

  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [serverErrors, setServerErrors] = useState<
    FieldErrors<LoginFormSchema> | undefined
  >(undefined);

  async function onSubmit(data: LoginFormSchema): Promise<void> {
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
    console.log(fetcher.data);
    if (!fetcher.data) return;

    if (fetcher.data.status === 200) {
      toast.success("Success", { description: fetcher.data.data });
      setTimeout(() => {
        navigate("/otp-login?index");
      }, 500);
      return;
    }
    if (
      fetcher.data.status === 400 &&
      fetcher.data.data &&
      fetcher.data.data.fieldErrors
    ) {
      setServerErrors(fetcher.data.data.fieldErrors);
      return;
    }
    if (typeof fetcher.data.data === "string" && fetcher.data.status > 300) {
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
        <LoginForm
          handleFormSubmit={onSubmit}
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
      googleAuthUrl: generateGoogleAuthUrl("sign-in"),
      error,
    },
  };
};

export const action: ActionFunction = async ({ request }) => {
  const requestData = await request.json();

  const validatedData = loginFormSchema.safeParse(requestData);

  if (!validatedData.success) {
    const fieldErrors: FieldErrors<LoginFormSchema> = {};

    const zodFieldErrors = validatedData.error.formErrors.fieldErrors;
    Object.entries(zodFieldErrors).forEach(([field, errors]) => {
      if (errors && errors.length > 0) {
        fieldErrors[field as keyof LoginFormSchema] = {
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
    const user = await generateLoginRequest(validatedData.data);

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
    return { status: 200, data: "prelogin successful" };
  } catch (err) {
    if (err instanceof AuthError) {
      return data(
        {
          status: err.status,
          data: err.message,
        },
        { status: err.status }
      );
    } else {
      console.error(err);
      return data(
        {
          status: 500,
          data: "internal server error",
        },
        { status: 500 }
      );
    }
  }
};
