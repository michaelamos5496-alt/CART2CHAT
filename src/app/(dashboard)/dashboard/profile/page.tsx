import type { Metadata } from "next";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOwnProfile } from "@/features/profile/lib/queries";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const profile = await getOwnProfile();
  if (!profile) return null;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm">
          Your personal account details.
        </p>
      </div>

      <Card className="lg:max-w-2xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback>
              {profile.email.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">
              {profile.full_name || profile.email}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Member since {formatDate(profile.created_at)}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
