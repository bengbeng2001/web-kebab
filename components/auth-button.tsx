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

  // Get user profile from users table
  const { data: profile } = await supabase
    .from('users')
    .select('username, display_name')
    .eq('id', user?.id)
    .single();

  return user ? (
    <div className="flex items-center gap-3">
      Halo, {profile?.display_name || profile?.username || 'User'}!
      <CartButton/>
      <MainButton />
      <LogoutButton />
    </div>
  ) : (
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
