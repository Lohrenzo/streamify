import Link from "next/link";
import React from "react";

export default function ErrorPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="text-gray-700">
        There was an error during the authentication process. Please try again.
      </p>
      <Link href="/auth/signin" className="text-blue-500 hover:underline">
        Go back to Sign In
      </Link>
    </main>
  );
}
