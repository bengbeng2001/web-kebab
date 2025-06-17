"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

export function MainButton() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUserSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        const { data: profile, error } = await supabase
          .from('users_public')
          .select('role')
          .eq('auth_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          return;
        }
        if (profile?.role) {
          setUserRole(profile.role);
        }
      }
    };

    getUserSession();
  }, [supabase]);

  const handleClick = () => {
    if (userId && userRole === 'admin') {
      router.push("/admin");
    } else if (userId && userRole === 'customer') {
      router.push("/customer");
    } else {
      router.push("/");
    }
  };

  return (
    <Button 
      onClick={handleClick}
      variant="ghost"
      size="icon"
      className="hover:bg-transparent dark:bg-white dark:text-black bg-black text-white"
    >
      <Home className="h-5 w-5" />
    </Button>
  );
}