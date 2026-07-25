import { notFound } from "next/navigation";
import { Wrench } from "lucide-react";

import { CartProvider } from "@/features/cart/lib/cart-context";
import { StoreFooter } from "@/features/storefront/components/store-footer";
import { StoreTopBar } from "@/features/storefront/components/store-top-bar";
import {
  getStorefrontBusiness,
  getStorefrontSettings,
} from "@/features/storefront/lib/queries";
import { isFeatureFlagEnabled } from "@/lib/feature-flags";

// Time-based revalidation (ISR): pages in this segment are statically
// generated and refreshed in the background at most once a minute, rather
// than hitting the database on every request.
export const revalidate = 60;

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getStorefrontBusiness(slug);

  if (!business) {
    notFound();
  }

  const maintenanceMode = await isFeatureFlagEnabled("maintenance_mode");

  if (maintenanceMode) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
        <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-full">
          <Wrench className="text-muted-foreground size-6" />
        </div>
        <h1 className="text-xl font-semibold">Down for maintenance</h1>
        <p className="text-muted-foreground mt-2 max-w-sm text-sm">
          {business.name} is temporarily unavailable while we make some
          improvements. Please check back shortly.
        </p>
      </div>
    );
  }

  const settings = await getStorefrontSettings(business.id);

  return (
    <CartProvider
      businessId={business.id}
      businessName={business.name}
      storeSlug={business.slug}
      whatsappNumber={business.whatsapp_number}
      currency={business.currency}
      deliveryFee={settings.delivery_fee}
      whatsappMessageTemplate={settings.whatsapp_message_template}
    >
      <div className="flex min-h-svh flex-col">
        <StoreTopBar business={business} showSearch />
        <div className="flex flex-1 flex-col">{children}</div>
        <StoreFooter business={business} />
      </div>
    </CartProvider>
  );
}
