import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";

import { Link } from "react-router";
import { useEffect } from "react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { activateAccountFormSchema } from "~/models/User";

type ActivateAccountFormProps = Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onSubmit"
> & {
  onSubmit: () => Promise<void>;
  error: null | string;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  otp: string;
  setOtp: React.Dispatch<React.SetStateAction<string>>;
  isLogin?: boolean;
};

export function ActivateAccountForm({
  className,
  onSubmit,
  error,
  setError,
  otp,
  setOtp,
  isLogin = false,
  ...props
}: ActivateAccountFormProps) {
  useEffect(() => {
    const isValid = activateAccountFormSchema.safeParse(otp).success;

    if (isValid) {
      onSubmit();
    }
  }, [otp]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {isLogin ? "Confirm Your Login" : "Activate Your Account"}
          </CardTitle>
          <CardDescription className="flex flex-col gap-2">
            <p>
              {isLogin
                ? "Login to Your Monarchy HIPAA Connector Account"
                : "Activate your Monarchy HIPAA Connector Account"}
            </p>
            <p>
              Please enter below the activation code you received at your email.
            </p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2 justify-center text-center">
                  <Label htmlFor="firstName">Activation Code</Label>
                  <InputOTP
                    maxLength={6}
                    name="otp"
                    aria-invalid={error ? "true" : "false"}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e);
                      setError(null);
                    }}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <Button type="submit" className="w-full">
                  {isLogin ? "Log In" : "Activate Account"}
                </Button>
              </div>
              {isLogin ? null : (
                <div className="text-center text-sm">
                  Do you already have an account?&nbsp;
                  <Link to="/sign-in" className="underline underline-offset-4">
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
