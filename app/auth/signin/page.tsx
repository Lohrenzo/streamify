import { redirect } from "next/navigation";
import { auth } from "@/auth";
// import ErrorDisplay from "@/app/components/auth/error";
import SignInForm from "@/app/components/auth/singnin";

/**
 * Server component page for user sign-in.
 * Redirects to the home page if a valid session already exists.
 *
 * @returns JSX element containing the sign-in form UI.
 */
async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="app-card p-6 max-w-lg w-full grid place-items-center">
        <h1 className="font-bold text-2xl text-center">Sign In</h1>
        <p className="text-sm text-center text-gray-400">
          Welcome back! Please sign in to continue.
        </p>
        {/* <ErrorDisplay /> */}
        <SignInForm />
      </div>
    </main>
  );
}

export default SignInPage;
