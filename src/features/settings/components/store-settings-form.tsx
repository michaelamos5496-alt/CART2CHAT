"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/shared/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  getBusinessImageUrl,
  removeBusinessBanner,
  removeBusinessLogo,
  uploadBusinessBanner,
  uploadBusinessLogo,
} from "@/features/business/lib/mutations";
import { BusinessHoursEditor } from "@/features/settings/components/business-hours-editor";
import { SocialLinksEditor } from "@/features/settings/components/social-links-editor";
import { StorePreview } from "@/features/settings/components/store-preview";
import { updateStoreSettings } from "@/features/settings/lib/mutations";
import { LockedOverlay } from "@/features/subscription/components/locked-overlay";
import { withDefaultHours } from "@/lib/hours";
import {
  CURRENCIES,
  storeSettingsSchema,
  type StoreSettingsInput,
} from "@/lib/validations/store-settings";
import type { Business } from "@/types/business";
import {
  BUSINESS_CATEGORIES,
  BUSINESS_CATEGORY_LABELS,
} from "@/types/business";
import type { BusinessSettings } from "@/types/business-settings";

export function StoreSettingsForm({
  business,
  settings,
  hasCustomBranding,
}: {
  business: Business;
  settings: BusinessSettings | null;
  hasCustomBranding: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [logoPath, setLogoPath] = React.useState(business.logo_path);
  const [bannerPath, setBannerPath] = React.useState(business.banner_path);

  const form = useForm<StoreSettingsInput>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      name: business.name,
      description: business.description ?? "",
      whatsappNumber: business.whatsapp_number,
      themeColor: business.theme_color,
      currency: business.currency as StoreSettingsInput["currency"],
      category: business.category,
      deliveryFee: settings?.delivery_fee ?? 0,
      businessHours: withDefaultHours(settings?.business_hours),
      socialLinks: {
        instagram: settings?.social_links.instagram ?? "",
        facebook: settings?.social_links.facebook ?? "",
        tiktok: settings?.social_links.tiktok ?? "",
        twitter: settings?.social_links.twitter ?? "",
        website: settings?.social_links.website ?? "",
      },
    },
  });

  const watchedValues = useWatch({ control: form.control });

  async function onSubmit(values: StoreSettingsInput) {
    setFormError(null);
    setIsSubmitting(true);

    try {
      await updateStoreSettings(business.id, values);
      toast.success("Store settings saved");
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <AuthErrorAlert message={formError} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Branding</CardTitle>
              <CardDescription>
                Shown at the top of your public storefront.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasCustomBranding ? (
                <div className="grid gap-6">
                  <div>
                    <p className="mb-2 text-sm font-medium">Logo</p>
                    <ImageUpload
                      imageUrl={logoPath ? getBusinessImageUrl(logoPath) : null}
                      imageAlt="Logo preview"
                      imageClassName="rounded-full"
                      onUpload={async (file) => {
                        const path = await uploadBusinessLogo(
                          business.id,
                          file,
                          logoPath,
                        );
                        setLogoPath(path);
                      }}
                      onRemove={async () => {
                        if (!logoPath) return;
                        await removeBusinessLogo(business.id, logoPath);
                        setLogoPath(null);
                      }}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium">Banner</p>
                    <ImageUpload
                      imageUrl={
                        bannerPath ? getBusinessImageUrl(bannerPath) : null
                      }
                      imageAlt="Banner preview"
                      layout="column"
                      imageClassName="aspect-[3/1] size-auto w-full max-w-md"
                      maxFileSize={4 * 1024 * 1024}
                      onUpload={async (file) => {
                        const path = await uploadBusinessBanner(
                          business.id,
                          file,
                          bannerPath,
                        );
                        setBannerPath(path);
                      }}
                      onRemove={async () => {
                        if (!bannerPath) return;
                        await removeBusinessBanner(business.id, bannerPath);
                        setBannerPath(null);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <LockedOverlay message="Upgrade your plan to add a custom logo and banner">
                  <div className="grid gap-6">
                    <div>
                      <p className="mb-2 text-sm font-medium">Logo</p>
                      <ImageUpload
                        imageUrl={null}
                        imageClassName="rounded-full"
                        onUpload={async () => {}}
                        onRemove={async () => {}}
                      />
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium">Banner</p>
                      <ImageUpload
                        imageUrl={null}
                        layout="column"
                        imageClassName="aspect-[3/1] size-auto w-full max-w-md"
                        onUpload={async () => {}}
                        onRemove={async () => {}}
                      />
                    </div>
                  </div>
                </LockedOverlay>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Store profile</CardTitle>
              <CardDescription>
                Storefront URL: /store/{business.slug}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business name</FormLabel>
                    <FormControl>
                      <Input disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="A short description of your business"
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
                      <Input type="tel" disabled={isSubmitting} {...field} />
                    </FormControl>
                    <FormDescription>
                      Orders are sent to this number.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="themeColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary color</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            className="border-input h-9 w-10 shrink-0 cursor-pointer rounded-md border p-1"
                            disabled={isSubmitting}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            aria-label="Primary color"
                          />
                          <Input disabled={isSubmitting} {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shop category</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BUSINESS_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {BUSINESS_CATEGORY_LABELS[category]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Used to tailor product option suggestions, like sizes
                        for fashion or flavors for food.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Checkout</CardTitle>
              <CardDescription>
                Applied to every order placed through your storefront cart.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="deliveryFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery fee</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        inputMode="decimal"
                        disabled={isSubmitting}
                        name={field.name}
                        ref={field.ref}
                        onBlur={field.onBlur}
                        value={Number.isNaN(field.value) ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      Set to 0 for free delivery.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Business hours</CardTitle>
              <CardDescription>
                Shown to customers on your storefront.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessHoursEditor
                control={form.control}
                disabled={isSubmitting}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Social links</CardTitle>
              <CardDescription>Optional — leave any blank.</CardDescription>
            </CardHeader>
            <CardContent>
              <SocialLinksEditor
                control={form.control}
                disabled={isSubmitting}
              />
            </CardContent>
          </Card>

          <div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </Form>

      <StorePreview
        storeSlug={business.slug}
        logoUrl={logoPath ? getBusinessImageUrl(logoPath) : null}
        bannerUrl={bannerPath ? getBusinessImageUrl(bannerPath) : null}
        values={{
          name: watchedValues.name ?? "",
          description: watchedValues.description ?? "",
          themeColor: watchedValues.themeColor ?? business.theme_color,
          businessHours: withDefaultHours(
            watchedValues.businessHours as StoreSettingsInput["businessHours"],
          ),
          socialLinks: watchedValues.socialLinks ?? {},
        }}
      />
    </div>
  );
}
