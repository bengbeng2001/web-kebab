import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function ErrorPage({
  searchParams,
}: {
  searchParams: { error: string };
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
            <CardDescription>
              There was a problem with the authentication process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-red-500">
                {searchParams.error || "An unknown error occurred"}
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/auth/login">Back to Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">Try Sign Up Again</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
