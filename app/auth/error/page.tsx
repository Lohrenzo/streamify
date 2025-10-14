import Link from "next/link";
import React from "react";

/**
 * Renders a simple authentication error page with a link back to the sign-in screen.
 *
 * @returns JSX element describing the authentication error and navigation to sign in.
 */
export default function ErrorPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center flex-col p-6">
      <div className="app-card p-6 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-gray-400">
          There was an error during the authentication process. Please try
          again.
        </p>
        <Link
          href="/auth/signin"
          className="app-button inline-block px-4 py-2 mt-4"
        >
          Go back to Sign In
        </Link>
      </div>
    </main>
  );
}
