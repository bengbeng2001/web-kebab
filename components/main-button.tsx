"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home } from "lucide-react";

export function MainButton() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (!error && profile) {
          setUserRole(profile.role);
        }
      }
    };

    checkUserRole();
  }, []);

  const handleClick = () => {
    if (userRole === 'admin') {
      router.push('/admin');
    } else {
      router.push('/customer');
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