import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Tourism Platform CMS
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your tourism websites
          </p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}