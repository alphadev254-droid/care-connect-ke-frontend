import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, Phone, Calendar, MapPin, Edit, X } from "lucide-react";
import { dashboardCard, responsive } from "@/theme";
import { useSecureFile } from "@/hooks/useSecureFile";

interface Props {
  profileData: any;
  isEditing: boolean;
  imagePreview: string | null;
  removeImage: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export const ProfileSidebar = ({ profileData, isEditing, imagePreview, removeImage, onImageChange, onRemoveImage }: Props) => {
  const initials = `${profileData?.firstName?.charAt(0) ?? ""}${profileData?.lastName?.charAt(0) ?? ""}`;
  const storedImageUrl = profileData?.profileImage ?? profileData?.Caregiver?.profileImage ?? null;
  const secureImageUrl = useSecureFile(storedImageUrl);
  // While editing: if removeImage is flagged or a new preview exists, don't show the stored image
  const displayUrl = imagePreview ?? (removeImage ? null : secureImageUrl);

  return (
    <Card className={dashboardCard.base}>
      <CardContent className={`${dashboardCard.compactBody} flex flex-col items-center text-center gap-3 pt-5`}>
        <div className="relative">
          {displayUrl ? (
            <img src={displayUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover border-2 border-primary/20" />
          ) : (
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
              {initials}
            </div>
          )}
          {isEditing && (
            <>
              <div className="absolute bottom-0 right-0">
                <Label htmlFor="profileImageInput" className="cursor-pointer">
                  <div className="bg-primary text-primary-foreground rounded-full p-1.5 hover:bg-primary/90">
                    <Edit className="h-3 w-3" />
                  </div>
                </Label>
                <Input id="profileImageInput" type="file" accept="image/*" onChange={onImageChange} className="hidden" />
              </div>
              {displayUrl && (
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </>
          )}
        </div>
        <div>
          <p className={`${responsive.cardTitle} font-semibold`}>{profileData?.firstName} {profileData?.lastName}</p>
          <p className={responsive.bodyMuted}>{profileData?.email}</p>
          <Badge variant="secondary" className="mt-1 text-xs capitalize">{profileData?.role?.replace("_", " ")}</Badge>
        </div>
      </CardContent>

      <div className="border-t border-border/60" />

      <CardContent className={`${dashboardCard.compactBody} space-y-1`}>
        <div className={dashboardCard.listRow}>
          <div className="flex items-center gap-2">
            <div className={dashboardCard.iconWell.primary}><Shield className="h-3.5 w-3.5 text-primary" /></div>
            <div>
              <p className={responsive.bodyMuted}>Role</p>
              <p className={`${responsive.body} font-medium capitalize`}>{profileData?.Role?.name?.replace("_", " ") || profileData?.role?.replace("_", " ") || "Not assigned"}</p>
            </div>
          </div>
        </div>
        <div className={dashboardCard.listRow}>
          <div className="flex items-center gap-2">
            <div className={dashboardCard.iconWell.secondary}><Phone className="h-3.5 w-3.5 text-secondary" /></div>
            <div>
              <p className={responsive.bodyMuted}>Phone</p>
              <p className={`${responsive.body} font-medium`}>{profileData?.phone || "Not provided"}</p>
            </div>
          </div>
        </div>
        {profileData?.Patient?.dateOfBirth && (
          <div className={dashboardCard.listRow}>
            <div className="flex items-center gap-2">
              <div className={dashboardCard.iconWell.accent}><Calendar className="h-3.5 w-3.5 text-accent" /></div>
              <div>
                <p className={responsive.bodyMuted}>Date of Birth</p>
                <p className={`${responsive.body} font-medium`}>{new Date(profileData.Patient.dateOfBirth).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
        {profileData?.idNumber && (
          <div className={dashboardCard.listRow}>
            <div className="flex items-center gap-2">
              <div className={dashboardCard.iconWell.warning}><Shield className="h-3.5 w-3.5 text-warning" /></div>
              <div>
                <p className={responsive.bodyMuted}>ID Number</p>
                <p className={`${responsive.body} font-medium`}>{profileData.idNumber}</p>
              </div>
            </div>
          </div>
        )}
        {(profileData?.role === "regional_manager" || profileData?.role === "Accountant") && profileData?.assignedRegion && (
          <div className={dashboardCard.listRow}>
            <div className="flex items-center gap-2">
              <div className={dashboardCard.iconWell.success}><MapPin className="h-3.5 w-3.5 text-success" /></div>
              <div>
                <p className={responsive.bodyMuted}>Assigned Region</p>
                <p className={`${responsive.body} font-medium`}>{profileData.assignedRegion === "all" ? "All Regions" : profileData.assignedRegion}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
