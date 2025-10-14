import { auth } from "@/auth";
import { redirect } from "next/navigation";
// import ErrorDisplay from "@/app/components/auth/error";
import SignUpForm from "@/app/components/auth/signup";

async function SignUpPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="border border-gray-700 my-6 shadow-lg shadow-blue-800/20 hover:shadow-blue-800/25 bg-black/30 backdrop-blur-lg p-4 rounded-md max-w-lg w-full grid place-items-center">
        <h1 className="font-bold text-2xl text-center text-white">Sign Up</h1>
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
