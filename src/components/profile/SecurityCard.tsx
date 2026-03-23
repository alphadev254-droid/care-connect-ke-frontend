import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Lock, Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react";
import { dashboardCard, responsive } from "@/theme";

interface Props {
  onPasswordChange: (data: { currentPassword: string; newPassword: string }) => void;
  isPending: boolean;
  onDeleteAccount: () => void;
  isDeleting: boolean;
  showDelete: boolean;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (v: boolean) => void;
}

export const SecurityCard = ({ onPasswordChange, isPending, onDeleteAccount, isDeleting, showDelete, deleteDialogOpen, setDeleteDialogOpen }: Props) => {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) return;
    if (passwordData.newPassword.length < 6) return;
    onPasswordChange({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordDialogOpen(false);
  };

  return (
    <Card className={dashboardCard.base}>
      <div className={`${dashboardCard.compactHeader} border-b border-border/60 flex items-center gap-2`}>
        <div className={dashboardCard.iconWell.warning}><Lock className="h-3.5 w-3.5 text-warning" /></div>
        <h2 className={responsive.cardTitle}>Security Settings</h2>
      </div>
      <CardContent className={`${dashboardCard.compactBody} space-y-3`}>
        <p className={responsive.bodyMuted}>Keep your account secure by using a strong password and changing it regularly.</p>

        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
              <Lock className="h-3 w-3" />Change Password
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className={responsive.dialogTitle}>Change Password</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {[
                { id: "cur", label: "Current Password", val: passwordData.currentPassword, show: showCurrent, toggle: () => setShowCurrent(!showCurrent), onChange: (v: string) => setPasswordData({ ...passwordData, currentPassword: v }) },
                { id: "new", label: "New Password", val: passwordData.newPassword, show: showNew, toggle: () => setShowNew(!showNew), onChange: (v: string) => setPasswordData({ ...passwordData, newPassword: v }) },
                { id: "con", label: "Confirm New Password", val: passwordData.confirmPassword, show: showConfirm, toggle: () => setShowConfirm(!showConfirm), onChange: (v: string) => setPasswordData({ ...passwordData, confirmPassword: v }) },
              ].map(({ id, label, val, show, toggle, onChange }) => (
                <div key={id} className="space-y-1">
                  <Label className={responsive.bodyMuted}>{label}</Label>
                  <div className="relative">
                    <Input type={show ? "text" : "password"} value={val} onChange={(e) => onChange(e.target.value)} />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={toggle}>
                      {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={isPending}>
                  {isPending ? "Changing..." : "Change Password"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {showDelete && (
          <div className="border-t pt-3">
            <div className="flex items-start justify-between gap-3 p-2 sm:p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <div>
                <p className={`${responsive.body} font-medium text-destructive`}>Delete Account</p>
                <p className={responsive.bodyMuted}>Permanently removes your account and all data. Cannot be undone.</p>
              </div>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="h-7 text-xs shrink-0">
                    <Trash2 className="h-3 w-3 mr-1" />Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className={`${responsive.dialogTitle} flex items-center gap-2 text-destructive`}>
                      <AlertTriangle className="h-4 w-4" />Delete Account
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-3 space-y-2">
                    <p className={responsive.body}>This will:</p>
                    <ul className={`${responsive.bodyMuted} list-disc list-inside space-y-1`}>
                      <li>Remove your personal information from active systems</li>
                      <li>Cancel all future appointments</li>
                      <li>Process within 30 days</li>
                      <li>Retain some data as required by law</li>
                    </ul>
                    <p className={`${responsive.body} font-medium text-destructive`}>This action cannot be undone.</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>Cancel</Button>
                    <Button variant="destructive" onClick={onDeleteAccount} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
