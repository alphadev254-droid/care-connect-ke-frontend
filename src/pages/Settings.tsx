import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { dashboardCard, responsive } from "@/theme";
import { User, Shield, Bell, Lock, HelpCircle, ExternalLink, Trash2, Mail, Phone } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const settingsSections = [
    {
      icon: User,
      title: "Profile Settings",
      description: "Update your personal information, contact details, and professional credentials",
      action: () => navigate('/dashboard/profile'),
      buttonText: "Edit Profile",
      iconWell: dashboardCard.iconWell.primary,
      iconColor: "text-primary",
    },
    {
      icon: Lock,
      title: "Password & Security",
      description: "Change your password and manage account security settings",
      action: () => navigate('/dashboard/profile'),
      buttonText: "Go to Profile",
      iconWell: dashboardCard.iconWell.success,
      iconColor: "text-success",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Email notifications are automatically sent for appointments and important updates",
      info: "Notifications are managed automatically by the system",
      iconWell: dashboardCard.iconWell.secondary,
      iconColor: "text-secondary",
    },
    {
      icon: Shield,
      title: "Privacy & Data",
      description: "Your data is protected according to healthcare privacy regulations",
      info: "We follow strict HIPAA-compliant data protection policies",
      iconWell: dashboardCard.iconWell.warning,
      iconColor: "text-warning",
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "Need assistance? Contact our support team",
      action: () => { window.location.href = 'mailto:support@tunzaconnect.com'; },
      buttonText: "Contact Support",
      iconWell: dashboardCard.iconWell.accent,
      iconColor: "text-accent",
    },
  ];

  return (
    <DashboardLayout userRole={user?.role || 'patient'}>
      <div className="space-y-3 md:space-y-4">
        <div>
          <h1 className={responsive.pageTitle}>Settings</h1>
          <p className={responsive.pageSubtitle}>Manage your account and preferences</p>
        </div>

        {/* Settings Cards */}
        <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
          {settingsSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className={dashboardCard.base}>
                <div className={`${dashboardCard.compactHeader} border-b`}>
                  <div className="flex items-center gap-3">
                    <div className={section.iconWell}>
                      <Icon className={`h-4 w-4 ${section.iconColor}`} />
                    </div>
                    <div>
                      <h3 className={responsive.cardTitle}>{section.title}</h3>
                      <p className={responsive.bodyMuted}>{section.description}</p>
                    </div>
                  </div>
                </div>
                <CardContent className={dashboardCard.compactBody}>
                  {section.info ? (
                    <div className="flex items-start gap-2 p-2 sm:p-3 rounded-lg bg-muted/40">
                      <p className={responsive.bodyMuted}>{section.info}</p>
                    </div>
                  ) : (
                    <Button onClick={section.action} variant="outline" size="sm" className="gap-2 h-7 text-xs">
                      {section.buttonText}
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Account Information */}
        <Card className={dashboardCard.base}>
          <div className={`${dashboardCard.compactHeader} border-b`}>
            <h2 className={responsive.cardTitle}>Account Information</h2>
            <Badge variant="secondary" className="capitalize text-xs">{user?.role?.replace('_', ' ')}</Badge>
          </div>
          <CardContent className={`${dashboardCard.compactBody} space-y-2`}>
            <div className="grid sm:grid-cols-2 gap-2">
              <div className={dashboardCard.listRow}>
                <div className="flex items-center gap-2">
                  <div className={dashboardCard.iconWell.primary}>
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div>
                    <p className={responsive.bodyMuted}>Name</p>
                    <p className={`${responsive.body} font-medium`}>{user?.firstName} {user?.lastName}</p>
                  </div>
                </div>
              </div>
              <div className={dashboardCard.listRow}>
                <div className="flex items-center gap-2">
                  <div className={dashboardCard.iconWell.secondary}>
                    <Mail className="h-3.5 w-3.5 text-secondary" />
                  </div>
                  <div>
                    <p className={responsive.bodyMuted}>Email</p>
                    <p className={`${responsive.body} font-medium`}>{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className={dashboardCard.listRow}>
                <div className="flex items-center gap-2">
                  <div className={dashboardCard.iconWell.accent}>
                    <Phone className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div>
                    <p className={responsive.bodyMuted}>Phone</p>
                    <p className={`${responsive.body} font-medium`}>{user?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              <div className={dashboardCard.listRow}>
                <div className="flex items-center gap-2">
                  <div className={dashboardCard.iconWell.warning}>
                    <Shield className="h-3.5 w-3.5 text-warning" />
                  </div>
                  <div>
                    <p className={responsive.bodyMuted}>Account Type</p>
                    <p className={`${responsive.body} font-medium capitalize`}>{user?.role?.replace('_', ' ')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-1">
              <Button onClick={() => navigate('/dashboard/profile')} size="sm" className="gap-2 h-7 text-xs">
                <User className="h-3 w-3" />
                View Full Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {(user?.role === 'patient' || user?.role === 'caregiver') && (
          <Card className={`${dashboardCard.base} border-destructive/30`}>
            <div className={`${dashboardCard.compactHeader} border-b border-destructive/20`}>
              <div className="flex items-center gap-2">
                <div className={dashboardCard.iconWell.destructive}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </div>
                <h2 className={`${responsive.cardTitle} text-destructive`}>Danger Zone</h2>
              </div>
            </div>
            <CardContent className={dashboardCard.compactBody}>
              <div className="flex items-start justify-between gap-4 p-2 sm:p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div>
                  <p className={`${responsive.body} font-medium text-destructive mb-1`}>Delete Account</p>
                  <p className={responsive.bodyMuted}>
                    Permanently removes your account, appointments, and all associated data. This cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs shrink-0"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      window.location.href = 'mailto:support@tunzaconnect.com?subject=Account Deletion Request&body=I would like to delete my account. Please process this request.';
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <Card className={`${dashboardCard.base} bg-muted/30`}>
          <CardContent className={dashboardCard.compactBody}>
            <p className={responsive.bodyMuted}>TunzaConnect Health Management System</p>
            <p className={responsive.bodyMuted}>
              Support:{" "}
              <a href="mailto:support@tunzaconnect.com" className="text-primary hover:underline">
                support@tunzaconnect.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
