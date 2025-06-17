"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CartButton() {
  const router = useRouter();
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUserIdAndOrderCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAuthUserId(user.id);

        try {
          // Get user role from users_public
          const { data: userData, error: userError } = await supabase
            .from('users_public')
            .select('username, id, role')
            .eq('auth_id', user.id)
            .single();

          if (userError) { //kalau user error
            console.error("Error fetching user data in CartButton:", userError);
            return;
          }

          if (!userData || !userData.username || !userData.id) { //kalau user data, username, id tidak diketahui maka error
            console.log("User data, username, or id not found in CartButton for userId:", user.id);
            return;
          }

          // Set user role
          setUserRole(userData.role);

          // Only fetch order count if user is a customer
          if (userData.role === 'customer') {
            const publicUserId = userData.id;

            const { count, error: countError } = await supabase
              .from('orders')
              .select('id', { count: 'exact', head: true })
              .eq('public_users_id', publicUserId);

            if (countError) {
              console.error("Error fetching order count in CartButton:", countError);
              return;
            }
            setOrderCount(count || 0);
          }
        } catch (err) {
          console.error("Caught error in CartButton fetch order count:", err);
        }
      }
    };

    getUserIdAndOrderCount();
  }, [supabase]);

  const handleClick = () => {
    if (!authUserId || !userRole) return;

    if (userRole === 'customer') {
      router.push(`/customer/pesanan-anda?userId=${authUserId}`);
    } else{
      router.push("/");
    }
  };

  // Only show cart button for customers
  if (userRole !== 'customer') {
    return null;
  }

  return (
    <Button 
      onClick={handleClick}
      variant="ghost"
      size="icon"
      className="relative hover:bg-transparent dark:bg-white dark:text-black bg-black text-white"
    >
      <ShoppingCart className="h-5 w-5" />
      {orderCount > 0 && (
        <Badge 
          variant="destructive"
          className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 rounded-full text-xs"
        >
          {orderCount}
        </Badge>
      )}
    </Button>
  );
}