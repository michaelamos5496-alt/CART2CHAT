"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthErrorAlert } from "@/features/auth/components/auth-error-alert";
import { getAuthErrorMessage } from "@/features/auth/lib/errors";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validations/auth";

export function SignupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      businessName: "",
      whatsappNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: SignupInput) {
    setFormError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          business_name: values.businessName,
          whatsapp_number: values.whatsappNumber,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setIsSubmitting(false);
      setFormError(getAuthErrorMessage(error.message));
      return;
    }

    if (data.session) {
      // Email confirmation is disabled for this project: the user is
      // already authenticated and their business was just auto-provisioned.
      router.push("/dashboard");
      router.refresh();
      return;
    }

    router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <AuthErrorAlert message={formError} />
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business name</FormLabel>
              <FormControl>
                <Input
                  autoComplete="organization"
                  placeholder="Ada's Bakery"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="whatsappNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  autoComplete="tel"
                  placeholder="+15551234567"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Orders are sent to this number. Include your country code.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@business.com"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                At least 8 characters, with a letter and a number.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
}
