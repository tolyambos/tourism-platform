import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();
  
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Tourism Platform CMS
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Create and manage AI-powered tourism websites
          </p>
          
          <div className="space-y-4">
            <Link
              href="/sign-in"
              className="block w-full px-6 py-3 text-center text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors font-medium"
            >
              Sign In
            </Link>
            
            <Link
              href="/sign-up"
              className="block w-full px-6 py-3 text-center text-indigo-600 bg-white border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors font-medium"
            >
              Create Account
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Build unlimited tourism websites with AI-generated content</p>
          </div>
        </div>
      </div>
    </div>
  );
}