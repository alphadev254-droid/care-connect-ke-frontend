import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, MapPin, FileText, Heart, Users } from "lucide-react";
import { dashboardCard, responsive } from "@/theme";

interface PatientCardProps {
  profileData: any;
  isEditing: boolean;
  formData: any;
  setFormData: (d: any) => void;
}

export const PatientInfoCard = ({ profileData, isEditing, formData, setFormData }: PatientCardProps) => (
  <Card className={dashboardCard.base}>
    <div className={`${dashboardCard.compactHeader} border-b border-border/60 flex items-center gap-2`}>
      <div className={dashboardCard.iconWell.destructive}><Heart className="h-3.5 w-3.5 text-destructive" /></div>
      <h2 className={responsive.cardTitle}>Patient Information</h2>
    </div>
    <CardContent className={`${dashboardCard.compactBody} space-y-3`}>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className={responsive.bodyMuted}>Date of Birth</Label>
          {isEditing ? (
            <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
          ) : (
            <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>
              {profileData?.Patient?.dateOfBirth ? new Date(profileData.Patient.dateOfBirth).toLocaleDateString() : "Not provided"}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label className={responsive.bodyMuted}>Emergency Contact</Label>
          {isEditing ? (
            <Input value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />
          ) : (
            <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>{profileData?.Patient?.emergencyContact || "Not provided"}</p>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <Label className={responsive.bodyMuted}>Address</Label>
        {isEditing ? (
          <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={3} className="resize-none" />
        ) : (
          <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40 min-h-[60px]`}>{profileData?.Patient?.address || "Not provided"}</p>
        )}
      </div>

      {(profileData?.Patient?.patientType === "child" || profileData?.Patient?.patientType === "elderly") && (
        <div className="border-t pt-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className={dashboardCard.iconWell.primary}><Users className="h-3.5 w-3.5 text-primary" /></div>
            <h3 className={responsive.cardTitle}>Guardian Information</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Guardian Name", value: `${profileData?.Patient?.guardianFirstName ?? ""} ${profileData?.Patient?.guardianLastName ?? ""}` },
              { label: "Relationship", value: profileData?.Patient?.guardianRelationship },
              { label: "Guardian Phone", value: profileData?.Patient?.guardianPhone },
              { label: "Guardian Email", value: profileData?.Patient?.guardianEmail },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <Label className={responsive.bodyMuted}>{label}</Label>
                <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>{value || "Not provided"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

interface ProfessionalCardProps {
  profileData: any;
  isEditing: boolean;
  formData: any;
  setFormData: (d: any) => void;
  regions: string[];
  districts: string[];
  traditionalAuthorities: string[];
  allVillages: string[];
  onRegionChange: (v: string) => void;
  onDistrictChange: (v: string) => void;
}

export const ProfessionalInfoCard = ({
  profileData, isEditing, formData, setFormData,
  regions, districts, traditionalAuthorities, allVillages,
  onRegionChange, onDistrictChange,
}: ProfessionalCardProps) => {
  const cg = profileData?.Caregiver;
  return (
    <Card className={dashboardCard.base}>
      <div className={`${dashboardCard.compactHeader} border-b border-border/60 flex items-center gap-2`}>
        <div className={dashboardCard.iconWell.primary}><Shield className="h-3.5 w-3.5 text-primary" /></div>
        <h2 className={responsive.cardTitle}>Professional Information</h2>
      </div>
      <CardContent className={`${dashboardCard.compactBody} space-y-3`}>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "License Number", value: cg?.licenseNumber },
            { label: "Experience", value: cg?.experience ? `${cg.experience} years` : undefined },
            { label: "Licensing Institution", value: cg?.licensingInstitution },
          ].map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <Label className={responsive.bodyMuted}>{label}</Label>
              <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>{value || "Not provided"}</p>
            </div>
          ))}
          <div className="space-y-1">
            <Label className={responsive.bodyMuted}>Verification Status</Label>
            <div className="p-2">
              <Badge variant={cg?.verificationStatus === "APPROVED" ? "default" : "secondary"} className="text-xs uppercase">
                {cg?.verificationStatus}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label className={responsive.bodyMuted}>Qualifications</Label>
          <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>{cg?.qualifications || "Not provided"}</p>
        </div>

        <div className="space-y-1">
          <Label className={responsive.bodyMuted}>Professional Summary</Label>
          {isEditing ? (
            <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell patients about your experience..." rows={4} className="resize-none" />
          ) : (
            <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40 min-h-[60px] whitespace-pre-wrap`}>{cg?.bio || "No summary provided"}</p>
          )}
        </div>

        {/* Service Location */}
        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className={dashboardCard.iconWell.success}><MapPin className="h-3.5 w-3.5 text-success" /></div>
            <h3 className={responsive.cardTitle}>Service Location</h3>
          </div>
          {isEditing ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className={responsive.bodyMuted}>Region</Label>
                <Select value={formData.region} onValueChange={onRegionChange}>
                  <SelectTrigger><SelectValue placeholder="Select Region" /></SelectTrigger>
                  <SelectContent>{regions?.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className={responsive.bodyMuted}>District</Label>
                <Select value={formData.district} onValueChange={onDistrictChange} disabled={!formData.region}>
                  <SelectTrigger><SelectValue placeholder="Select District" /></SelectTrigger>
                  <SelectContent>{districts?.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className={responsive.bodyMuted}>Traditional Authorities</Label>
                <div className="border rounded-lg p-2 max-h-36 overflow-y-auto space-y-1.5">
                  {!formData.district ? <p className={responsive.bodyMuted}>Select a district first</p>
                    : !traditionalAuthorities?.length ? <p className={responsive.bodyMuted}>No TAs available</p>
                    : traditionalAuthorities.map((ta) => (
                      <div key={ta} className="flex items-center gap-2">
                        <Checkbox id={`ta-${ta}`} checked={formData.traditionalAuthority.includes(ta)}
                          onCheckedChange={(checked) => {
                            const next = checked ? [...formData.traditionalAuthority, ta] : formData.traditionalAuthority.filter((t: string) => t !== ta);
                            setFormData({ ...formData, traditionalAuthority: next, village: [] });
                          }} />
                        <label htmlFor={`ta-${ta}`} className={`${responsive.body} cursor-pointer`}>{ta}</label>
                      </div>
                    ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className={responsive.bodyMuted}>Villages</Label>
                <div className="border rounded-lg p-2 max-h-36 overflow-y-auto space-y-1.5">
                  {!formData.traditionalAuthority.length ? <p className={responsive.bodyMuted}>Select a TA first</p>
                    : !allVillages?.length ? <p className={responsive.bodyMuted}>No villages available</p>
                    : allVillages.map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <Checkbox id={`v-${v}`} checked={formData.village.includes(v)}
                          onCheckedChange={(checked) => {
                            const next = checked ? [...formData.village, v] : formData.village.filter((x: string) => x !== v);
                            setFormData({ ...formData, village: next });
                          }} />
                        <label htmlFor={`v-${v}`} className={`${responsive.body} cursor-pointer`}>{v}</label>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {cg?.region && <div className="space-y-1"><Label className={responsive.bodyMuted}>Region</Label><p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>{cg.region}</p></div>}
              {cg?.district && <div className="space-y-1"><Label className={responsive.bodyMuted}>District</Label><p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>{cg.district}</p></div>}
              {cg?.traditionalAuthority && (Array.isArray(cg.traditionalAuthority) ? cg.traditionalAuthority.length > 0 : true) && (
                <div className="space-y-1">
                  <Label className={responsive.bodyMuted}>Traditional Authorities</Label>
                  <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>{Array.isArray(cg.traditionalAuthority) ? cg.traditionalAuthority.join(", ") : cg.traditionalAuthority}</p>
                </div>
              )}
              {cg?.village && (Array.isArray(cg.village) ? cg.village.length > 0 : true) && (
                <div className="space-y-1">
                  <Label className={responsive.bodyMuted}>Villages</Label>
                  <p className={`${responsive.body} font-medium p-2 rounded-lg bg-muted/40`}>{Array.isArray(cg.village) ? cg.village.join(", ") : cg.village}</p>
                </div>
              )}
              {!cg?.region && !cg?.district && (
                <p className={`${responsive.bodyMuted} p-2 col-span-2`}>Location not provided</p>
              )}
            </div>
          )}
        </div>

        {/* Documents */}
        {(Array.isArray(cg?.idDocuments) || Array.isArray(cg?.supportingDocuments)) && (
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className={dashboardCard.iconWell.secondary}><FileText className="h-3.5 w-3.5 text-secondary" /></div>
              <h3 className={responsive.cardTitle}>Uploaded Documents</h3>
            </div>
            {Array.isArray(cg?.idDocuments) && cg.idDocuments.length > 0 && (
              <div className="p-2 rounded-lg bg-muted/40 space-y-1">
                <p className={`${responsive.body} font-medium`}>ID Documents ({cg.idDocuments.length})</p>
                {cg.idDocuments.map((doc: any, i: number) => (
                  <p key={i} className={`${responsive.bodyMuted} flex items-center gap-1.5`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />{doc.filename}
                  </p>
                ))}
              </div>
            )}
            {Array.isArray(cg?.supportingDocuments) && cg.supportingDocuments.length > 0 && (
              <div className="p-2 rounded-lg bg-muted/40 space-y-1">
                <p className={`${responsive.body} font-medium`}>Supporting Documents ({cg.supportingDocuments.length})</p>
                {cg.supportingDocuments.map((doc: any, i: number) => (
                  <p key={i} className={`${responsive.bodyMuted} flex items-center gap-1.5`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />{doc.filename}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
