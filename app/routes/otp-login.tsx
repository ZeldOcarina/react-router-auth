import { useEffect, useState } from "react";
import {
  data,
  useFetcher,
  useNavigate,
  type ActionFunction,
} from "react-router";
import { toast } from "sonner";
import { SmallAppLogo } from "~/components/AppLogo";
import { ActivateAccountForm } from "~/components/auth/ActivateAccountForm";
import { createUserSession, verifyOtp } from "~/data/auth.server";
import { activateAccountFormSchema } from "~/models/User";
import { v4 as uuidv4 } from "uuid";
import { authSessionStorage } from "~/sessions.server";

export default function OtpLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [fetcherKey, setFetcherKey] = useState(uuidv4());
  const fetcher = useFetcher({ key: fetcherKey });
  const navigate = useNavigate();

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.status !== 200) {
      setError(fetcher.data.data);
      setFetcherKey(uuidv4());
      return;
    }

    toast.success("success", { description: fetcher.data.data });
    setFetcherKey(uuidv4());

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        navigate("/app?index");
      });
    });
  }, [fetcher.data]);

  async function onSubmit() {
    const isValid = activateAccountFormSchema.safeParse(otp).success;

    if (isValid) {
      fetcher.submit(otp, {
        method: "POST",
        encType: "application/json",
      });
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex justify-center items-center gap-4 flex-col">
          <SmallAppLogo className="w-14" />
          Monarchy HIPAA Connector
        </div>
        <ActivateAccountForm
          onSubmit={onSubmit}
          error={error}
          otp={otp}
          setOtp={setOtp}
          setError={setError}
          isLogin
        />
      </div>
    </div>
  );
}

export const action: ActionFunction = async ({ request }) => {
  const json = await request.json();

  const parsedOtp = activateAccountFormSchema.safeParse(String(json));

  if (!parsedOtp.success) {
    return data(
      { status: 400, data: "otp must be six characters long" },
      { status: 400 }
    );
  }

  const { isOtpValid, user } = await verifyOtp(parsedOtp.data);

  if (!isOtpValid || !user) {
    return data({ status: 401, data: "otp is invalid" });
  }

  // log the user in
  const session = await createUserSession(user.id);

  return data(
    { status: 200, data: "login successfull" },
    {
      headers: {
        "Set-Cookie": await authSessionStorage.commitSession(session),
      },
    }
  );
};
