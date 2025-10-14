"use client";
import { authenticateWithGoogle, handleSignIn } from "@/app/actions/auth";
import Button from "@/app/components/Button";
import { useTransition } from "react";

export default function SignInForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <>
      {/* Credentials Signin Form */}
      <form
        action={(formData) =>
          startTransition(async () => {
            handleSignIn(formData);
          })
        }
        className="mt-2 flex flex-col gap-4 min-w-full"
      >
        <label className="grid grid-cols-1 font-bold text-sm gap-1 w-full">
          Email
          <input
            required
            className="outline-none active:outline-none focus:outline-none ring-1 ring-blue-300/40 focus:ring-blue-400/50 rounded-md p-2"
            name="email"
            type="email"
            autoComplete="email"
          />
        </label>
        <label className="grid grid-cols-1 font-bold text-sm gap-1 w-full">
          Password
          <input
            required
            className="outline-none active:outline-none focus:outline-none ring-1 ring-blue-300/40 focus:ring-blue-400/50 rounded-md p-2"
            name="password"
            type="password"
            autoComplete="current-password"
          />
        </label>
        <Button disabled={isPending} type="submit" title="Sign In" />
      </form>

      {/* Divider */}
      <div className="my-3 flex flex-row items-center justify-center gap-2 w-full">
        <hr className="text-blue-300/40 w-full" />
        <small className="text-gray-400">Or</small>
        <hr className="text-blue-300/40 w-full" />
      </div>

      {/* Google Signin Button */}
      <form
        action={() =>
          startTransition(async () => {
            authenticateWithGoogle();
          })
        }
        className="mb-4 flex flex-col gap-4 min-w-full"
      >
        <Button
          disabled={isPending}
          type="submit"
          title="Continue with Google"
        />
      </form>

      {/* Sign Up Link */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <a
            href="/auth/signup"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign Up
          </a>
        </p>
      </div>
    </>
  );
}
