import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { dashboardCard, responsive } from "@/theme";

interface Props {
  profileData: any;
  isEditing: boolean;
  formData: any;
  setFormData: (d: any) => void;
}

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <Label className={responsive.bodyMuted}>{label}</Label>
    <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>{value || "Not provided"}</p>
  </div>
);

export const BasicInfoCard = ({ profileData, isEditing, formData, setFormData }: Props) => (
  <Card className={dashboardCard.base}>
    <div className={`${dashboardCard.compactHeader} border-b border-border/60 flex items-center gap-2`}>
      <div className={dashboardCard.iconWell.primary}><User className="h-3.5 w-3.5 text-primary" /></div>
      <h2 className={responsive.cardTitle}>Basic Information</h2>
    </div>
    <CardContent className={dashboardCard.compactBody}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className={responsive.bodyMuted}>First Name</Label>
          {isEditing ? (
            <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
          ) : (
            <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>{profileData?.firstName || "Not provided"}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className={responsive.bodyMuted}>Last Name</Label>
          {isEditing ? (
            <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
          ) : (
            <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>{profileData?.lastName || "Not provided"}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className={responsive.bodyMuted}>Phone Number</Label>
          {isEditing ? (
            <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          ) : (
            <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>{profileData?.phone || "Not provided"}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className={responsive.bodyMuted}>ID Number</Label>
          <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>{profileData?.idNumber || "Not provided"}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
