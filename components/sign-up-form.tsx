"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", email: "", password: "", repeatPassword: "", phone: "", address: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usernameExistsError, setUsernameExistsError] = useState<string | null>(null);
  const [emailExistsError, setEmailExistsError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const supabase = createClient(); // Pindahkan inisialisasi ke sini agar bisa digunakan di useEffect

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // Debounce check for username existence
  useEffect(() => {
    if (formData.username.length >= 3) {
      setIsCheckingUsername(true);
      const handler = setTimeout(async () => {
        const { data, error } = await supabase
          .from('users_public')
          .select('username')
          .eq('username', formData.username.toLowerCase().trim())
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error("Error checking username:", error);
          setUsernameExistsError("Error checking username availability.");
        } else if (data) {
          setUsernameExistsError("Username already taken.");
        } else {
          setUsernameExistsError(null);
        }
        setIsCheckingUsername(false);
      }, 500); // 500ms debounce

      return () => {
        clearTimeout(handler);
      };
    } else {
      setUsernameExistsError(null);
      setIsCheckingUsername(false);
    }
  }, [formData.username, supabase]);

  // Debounce check for email existence
  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      setIsCheckingEmail(true);
      const handler = setTimeout(async () => {
        // Check in public.users_public table for email existence
        const { data, error } = await supabase
          .from('users_public')
          .select('email')
          .eq('email', formData.email.toLowerCase().trim())
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error("Error checking email:", error);
          setEmailExistsError("Error checking email availability.");
        } else if (data) {
          setEmailExistsError("Email already registered.");
        } else {
          setEmailExistsError(null);
        }
        setIsCheckingEmail(false);
      }, 500); // 500ms debounce

      return () => {
        clearTimeout(handler);
      };
    } else {
      setEmailExistsError(null);
      setIsCheckingEmail(false);
    }
  }, [formData.email, supabase]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { username, email, password, repeatPassword, phone, address } = formData;

    // Add immediate validation for existence checks
    if (usernameExistsError || emailExistsError) {
      setError("Please resolve the existing username/email issues.");
      setLoading(false);
      return;
    }

    if (!username || username.length < 3) {
      setError("Username must be at least 3 characters long");
      setLoading(false);
      return;
    }
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            username: username.toLowerCase().trim(),
            role: 'customer',
            phone: phone.trim() || undefined,
            address: address.trim() || undefined
          }
        }
      });

      if (authError) throw authError;
      if (!data?.user) throw new Error('Signup failed');
      router.push("/auth/sign-up-success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Sign up</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="alif"
              required
              value={formData.username}
              onChange={handleChange}
              minLength={3}
            />
            {isCheckingUsername && <p className="text-sm text-muted-foreground">Checking availability...</p>}
            {usernameExistsError && <p className="text-sm text-red-500">{usernameExistsError}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="alif@gmail.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
            {isCheckingEmail && <p className="text-sm text-muted-foreground">Checking availability...</p>}
            {emailExistsError && <p className="text-sm text-red-500">{emailExistsError}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., 081234567890"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="e.g., Jl. Kebon Raya No. 123"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              placeholder="minimal 6 huruf"
            />
          </div>
          <div>
            <Label htmlFor="repeatPassword">Repeat Password</Label>
            <Input
              id="repeatPassword"
              type="password"
              required
              value={formData.repeatPassword}
              onChange={handleChange}
              placeholder="minimal 6 huruf"
            />
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}
          
          <Button type="submit" className="w-full" disabled={loading || isCheckingUsername || isCheckingEmail || usernameExistsError !== null || emailExistsError !== null}>
            {loading || isCheckingUsername || isCheckingEmail ? "Checking..." : "Sign Up"}
          </Button>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline">
              Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
