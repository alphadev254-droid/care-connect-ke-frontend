import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileUp, Loader2, LogOut, ShieldCheck } from "lucide-react";

const toArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [String(parsed)];
  } catch {
    return [String(value)];
  }
};

const CaregiverVerification = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const [form, setForm] = useState({
    idNumber: "",
    dateOfBirth: "",
    licensingInstitution: "",
    licenseNumber: "",
    experience: "",
    qualifications: "",
    region: "",
    district: "",
    traditionalAuthority: [] as string[],
    village: [] as string[],
    specialtyIds: [] as string[],
  });
  const [regions, setRegions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["caregiver-verification"],
    queryFn: async () => {
      const response = await api.get("/caregivers/verification");
      return response.data;
    },
  });

  const { data: specialtiesData } = useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const response = await api.get("/specialties");
      return response.data.specialties || [];
    },
  });

  useEffect(() => {
    api.get("/locations/regions").then((response) => {
      setRegions(response.data.data || []);
    }).catch(() => toast.error("Failed to load counties"));
  }, []);

  useEffect(() => {
    const caregiver = data?.caregiver;
    if (!caregiver) return;
    setForm({
      idNumber: caregiver.User?.idNumber || "",
      dateOfBirth: caregiver.dateOfBirth || "",
      licensingInstitution: caregiver.licensingInstitution || "",
      licenseNumber: caregiver.licenseNumber?.startsWith("TEMP-") ? "" : caregiver.licenseNumber || "",
      experience: caregiver.experience ? String(caregiver.experience) : "",
      qualifications: caregiver.qualifications === "To be updated" ? "" : caregiver.qualifications || "",
      region: caregiver.region || "",
      district: caregiver.district || "",
      traditionalAuthority: toArray(caregiver.traditionalAuthority),
      village: toArray(caregiver.village),
      specialtyIds: (caregiver.Specialties || []).map((specialty: any) => String(specialty.id)),
    });
  }, [data]);

  useEffect(() => {
    if (!form.region) return;
    api.get(`/locations/districts/${encodeURIComponent(form.region)}`).then((response) => {
      setDistricts(response.data.data || []);
    }).catch(() => toast.error("Failed to load constituencies"));
  }, [form.region]);

  useEffect(() => {
    if (!form.region || !form.district) return;
    api.get(`/locations/traditional-authorities/${encodeURIComponent(form.region)}/${encodeURIComponent(form.district)}`).then((response) => {
      setWards(response.data.data || []);
    }).catch(() => toast.error("Failed to load wards"));
  }, [form.region, form.district]);

  useEffect(() => {
    if (!form.region || !form.district || form.traditionalAuthority.length === 0) {
      setVillages([]);
      return;
    }
    Promise.all(
      form.traditionalAuthority.map((ward) =>
        api.get(`/locations/villages/${encodeURIComponent(form.region)}/${encodeURIComponent(form.district)}/${encodeURIComponent(ward)}`)
      )
    ).then((responses) => {
      setVillages(Array.from(new Set(responses.flatMap((response) => response.data.data || []))));
    }).catch(() => toast.error("Failed to load sub-locations"));
  }, [form.region, form.district, form.traditionalAuthority]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.patch("/caregivers/verification", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caregiver-verification"] });
      toast.success("Saved");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ field, file }: { field: string; file: File }) => {
      const payload = new FormData();
      payload.append(field, file);
      const response = await api.post("/caregivers/verification/files", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caregiver-verification"] });
      toast.success("File uploaded");
    },
  });

  const checklist = data?.checklist || {};
  const completedCount = useMemo(
    () => ["personal", "professional", "location", "files"].filter((key) => checklist[key]).length,
    [checklist]
  );
  const caregiver = data?.caregiver;

  const toggleValue = (key: "traditionalAuthority" | "village" | "specialtyIds", value: string, checked: boolean) => {
    setForm((current) => ({
      ...current,
      [key]: checked ? [...current[key], value] : current[key].filter((item) => item !== value),
      ...(key === "traditionalAuthority" ? { village: [] } : {}),
    }));
  };

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (caregiver?.verificationStatus === "verified") {
    navigate("/dashboard");
    return null;
  }

  return (
    <main className="min-h-screen bg-muted/30 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Caregiver verification</h1>
            <p className="text-sm text-muted-foreground">Complete these sections while your account is awaiting admin review.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{completedCount}/4 complete</Badge>
            <Button variant="outline" onClick={async () => { await logout(); navigate("/login"); }}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" />
              Review status: {caregiver?.verificationStatus || "pending"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-4">
            {[
              ["personal", "Personal ID"],
              ["professional", "Professional details"],
              ["location", "Service location"],
              ["files", "Documents"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center gap-2 rounded-md border p-3 text-sm">
                <CheckCircle2 className={`h-4 w-4 ${checklist[key] ? "text-green-600" : "text-muted-foreground"}`} />
                {label}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Personal ID</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>National ID number</Label>
              <Input value={form.idNumber} onChange={(event) => setForm({ ...form, idNumber: event.target.value })} onBlur={() => saveMutation.mutate({ idNumber: form.idNumber })} />
            </div>
            <div className="space-y-2">
              <Label>Date of birth</Label>
              <Input type="date" value={form.dateOfBirth} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} onBlur={() => saveMutation.mutate({ dateOfBirth: form.dateOfBirth })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Professional Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Licensing institution</Label>
              <Input value={form.licensingInstitution} onChange={(event) => setForm({ ...form, licensingInstitution: event.target.value })} onBlur={() => saveMutation.mutate({ licensingInstitution: form.licensingInstitution })} />
            </div>
            <div className="space-y-2">
              <Label>License number</Label>
              <Input value={form.licenseNumber} onChange={(event) => setForm({ ...form, licenseNumber: event.target.value })} onBlur={() => saveMutation.mutate({ licenseNumber: form.licenseNumber })} />
            </div>
            <div className="space-y-2">
              <Label>Years of experience</Label>
              <Input type="number" min="0" value={form.experience} onChange={(event) => setForm({ ...form, experience: event.target.value })} onBlur={() => saveMutation.mutate({ experience: form.experience })} />
            </div>
            <div className="space-y-2">
              <Label>Qualifications</Label>
              <Input value={form.qualifications} onChange={(event) => setForm({ ...form, qualifications: event.target.value })} onBlur={() => saveMutation.mutate({ qualifications: form.qualifications })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Specialties</Label>
              <div className="grid max-h-48 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                {(specialtiesData || []).map((specialty: any) => (
                  <label key={specialty.id} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={form.specialtyIds.includes(String(specialty.id))} onCheckedChange={(checked) => toggleValue("specialtyIds", String(specialty.id), Boolean(checked))} />
                    {specialty.name}
                  </label>
                ))}
              </div>
              <Button size="sm" onClick={() => saveMutation.mutate({ specialtyIds: form.specialtyIds })}>Save specialties</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Service Location</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>County</Label>
              <Select value={form.region} onValueChange={(value) => setForm({ ...form, region: value, district: "", traditionalAuthority: [], village: [] })}>
                <SelectTrigger><SelectValue placeholder="Select county" /></SelectTrigger>
                <SelectContent>{regions.map((region) => <SelectItem key={region} value={region}>{region}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Constituency</Label>
              <Select value={form.district} onValueChange={(value) => setForm({ ...form, district: value, traditionalAuthority: [], village: [] })}>
                <SelectTrigger><SelectValue placeholder="Select constituency" /></SelectTrigger>
                <SelectContent>{districts.map((district) => <SelectItem key={district} value={district}>{district}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Wards</Label>
              <div className="max-h-44 overflow-y-auto rounded-md border p-3 space-y-2">
                {wards.map((ward) => (
                  <label key={ward} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={form.traditionalAuthority.includes(ward)} onCheckedChange={(checked) => toggleValue("traditionalAuthority", ward, Boolean(checked))} />
                    {ward}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sub-locations</Label>
              <div className="max-h-44 overflow-y-auto rounded-md border p-3 space-y-2">
                {villages.map((village) => (
                  <label key={village} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={form.village.includes(village)} onCheckedChange={(checked) => toggleValue("village", village, Boolean(checked))} />
                    {village}
                  </label>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <Button onClick={() => saveMutation.mutate({
                region: form.region,
                district: form.district,
                traditionalAuthority: form.traditionalAuthority,
                village: form.village,
              })}>Save location</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Documents</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {([
              ["profilePicture", "Profile picture", ".jpg,.jpeg,.png", "JPG or PNG · max 10MB"],
              ["idDocuments", "ID document", ".pdf,.doc,.docx,.jpg,.jpeg,.png", "PDF, DOC, DOCX or image · max 10MB · upload one at a time (up to 3)"],
              ["supportingDocuments", "Supporting document", ".pdf,.doc,.docx,.jpg,.jpeg,.png", "PDF, DOC, DOCX or image · max 10MB · upload one at a time (up to 5)"],
            ] as [string, string, string, string][]).map(([field, label, accept, hint]) => (
              <div key={field} className="space-y-2 rounded-md border p-3">
                <Label>{label}</Label>
                <Input type="file" accept={accept} onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadMutation.mutate({ field, file });
                }} />
                <p className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                  <FileUp className="h-3 w-3" />
                  {hint}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default CaregiverVerification;
