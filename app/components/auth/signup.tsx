"use client";
import { authenticateWithGoogle, handleSignUp } from "@/app/actions/auth";
import Button from "@/app/components/Button";
import { useTransition } from "react";

export default function SignUpForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <>
      {/* Credentials Sign Up Form */}
      <form
        action={(formData) =>
          startTransition(async () => {
            handleSignUp(formData);
          })
        }
        className="mt-2 flex flex-col gap-4 min-w-full"
      >
        <label className="grid grid-cols-1 font-bold text-sm gap-1 w-full">
          First Name
          <input
            required
            className="outline-none active:outline-none focus:outline-none ring-1 ring-blue-300/40 focus:ring-blue-400/50 rounded-md p-2"
            name="first_name"
            type="text"
            autoComplete="first_name"
            placeholder="John"
          />
        </label>

        <label className="grid grid-cols-1 font-bold text-sm gap-1 w-full">
          Last Name
          <input
            className="outline-none active:outline-none focus:outline-none ring-1 ring-blue-300/40 focus:ring-blue-400/50 rounded-md p-2"
            name="last_name"
            type="text"
            autoComplete="last_name"
            placeholder="Doe"
          />
        </label>

        <label className="grid grid-cols-1 font-bold text-sm gap-1 w-full">
          Username
          <input
            required
            className="outline-none active:outline-none focus:outline-none ring-1 ring-blue-300/40 focus:ring-blue-400/50 rounded-md p-2"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="johndoe1"
          />
        </label>

        <label className="grid grid-cols-1 font-bold text-sm gap-1 w-full">
          Email
          <input
            required
            className="outline-none active:outline-none focus:outline-none ring-1 ring-blue-300/40 focus:ring-blue-400/50 rounded-md p-2"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="john@example.com"
          />
        </label>

        <label className="grid grid-cols-1 font-bold text-sm gap-1 w-full">
          Password
          <input
            required
            className="outline-none active:outline-none focus:outline-none ring-1 ring-blue-300/40 focus:ring-blue-400/50 rounded-md p-2"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
          />
        </label>

        <label className="grid grid-cols-1 font-bold text-sm gap-1 w-full">
          Confirm Password
          <input
            required
            className="outline-none active:outline-none focus:outline-none ring-1 ring-blue-300/40 focus:ring-blue-400/50 rounded-md p-2"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
          />
        </label>

        <label className="grid grid-cols-1 font-bold text-sm gap-1 w-full">
          Date of Birth
          <input
            required
            className="outline-none active:outline-none focus:outline-none ring-1 ring-blue-300/40 focus:ring-blue-400/50 rounded-md p-2"
            name="dob"
            type="date"
            max={
              new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                .toISOString()
                .split("T")[0]
            } // Prevent future dates and ensure at least 18 years old
          />
        </label>

        <Button disabled={isPending} type="submit" title="Create Account" />
      </form>

      {/* Divider */}
      <div className="my-3 flex flex-row items-center justify-center gap-2 w-full">
        <hr className="text-blue-300/40 w-full" />
        <small className="text-gray-400">Or</small>
        <hr className="text-blue-300/40 w-full" />
      </div>

      {/* Google Sign Up Button */}
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

      {/* Sign In Link */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <a
            href="/auth/signin"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign In
          </a>
        </p>
      </div>
    </>
  );
}
