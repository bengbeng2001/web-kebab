import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { MainButton } from "./main-button";
import { CartButton } from "./cart-button";

export async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button asChild size="sm" variant={"outline"}>
          <Link href="/auth/login">Sign in</Link>
        </Button>
        <Button asChild size="sm" variant={"default"}>
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    );
  }

  // Get user profile from users_public table
  const { data: profile } = await supabase
    .from('users_public')
    .select('username')
    .eq('auth_id', user.id)
    .single();

  return (
    <div className="flex items-center gap-4">
      Hallo, {profile?.username || user.email}!
      <CartButton />
      <MainButton />
      <LogoutButton />
    </div>
  );
}