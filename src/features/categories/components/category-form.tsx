"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import {
  createCategory,
  updateCategory,
} from "@/features/categories/lib/mutations";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";
import type { Category } from "@/types/catalog";

export function CategoryForm({
  businessId,
  category,
  onCreated,
}: {
  businessId: string;
  category?: Category;
  // When provided (the "new category" flow), takes over from the default
  // post-create redirect so the caller can reveal the image upload inline
  // on the same page instead of navigating to /edit.
  onCreated?: (category: { id: string }) => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      isActive: category?.is_active ?? true,
    },
  });

  async function onSubmit(values: CategoryInput) {
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (category) {
        await updateCategory(category.id, values);
        toast.success("Category updated");
        router.refresh();
      } else {
        const created = await createCategory(businessId, values);
        toast.success("Category created");
        if (onCreated) {
          onCreated(created);
        } else {
          router.push(`/dashboard/categories/${created.id}/edit`);
        }
        router.refresh();
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <AuthErrorAlert message={formError} />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Breads"
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
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Turn off to hide this category and its products from your
                  storefront.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting
              ? "Saving..."
              : category
                ? "Save changes"
                : "Create category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
