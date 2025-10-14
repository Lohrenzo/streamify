import { auth } from "@/auth";
import { redirect } from "next/navigation";
// import ErrorDisplay from "@/app/components/auth/error";
import SignUpForm from "@/app/components/auth/signup";

/**
 * Server component page for user sign-up.
 * Redirects to the home page if a valid session already exists.
 *
 * @returns JSX element containing the sign-up form UI.
 */
async function SignUpPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="app-card p-6 max-w-lg w-full grid place-items-center">
        <h1 className="font-bold text-2xl text-center">Sign Up</h1>
        <p className="text-sm text-center text-gray-400">
          Welcome! Please fill in the details to get started.
        </p>
        {/* <ErrorDisplay /> */}
        <SignUpForm />
      </div>
    </main>
  );
}

export default SignUpPage;
