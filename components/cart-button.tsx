"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CartButton() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [orderCount, setOrderCount] = useState<number>(0);
  const supabase = createClient();

  useEffect(() => {
    const getUserIdAndOrderCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);

        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('username')
            .eq('id', user.id)
            .single();

          if (userError) {
            console.error("Error fetching user data in CartButton:", userError);
            return;
          }
          if (!userData || !userData.username) {
            console.log("User data or username not found in CartButton for userId:", user.id);
            return;
          }
          const username = userData.username;

          const { data: customerData, error: customerError } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single();

          if (customerError) {
            console.error("Error fetching customer data in CartButton:", customerError);
            return;
          }
          if (!customerData || !customerData.id) {
            console.log("Customer data or ID not found in CartButton for username:", username);
            return;
          }

          const customerIdFromCustomerTable = customerData.id;

          const { count, error: countError } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('users_id', customerIdFromCustomerTable);

          if (countError) {
            console.error("Error fetching order count in CartButton:", countError);
            return;
          }
          setOrderCount(count || 0);

        } catch (err) {
          console.error("Caught error in CartButton fetch order count:", err);
        }
      }
    };

    getUserIdAndOrderCount();
  }, [supabase]);

  const handleClick = () => {
    if (userId) {
      router.push(`/customer/pesanan-anda?userId=${userId}`);
    }
  };

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