import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  CreditCard,
  Wallet,
  ArrowRight,
  CheckCircle,
  Heart,
} from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const pages = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
    color: 'bg-blue-100 text-blue-700',
    description: 'Your home — see upcoming appointments, earnings summary, and quick stats at a glance.',
  },
  {
    icon: Calendar,
    label: 'Schedule',
    href: '/dashboard/schedule',
    color: 'bg-purple-100 text-purple-700',
    description: 'Set the days and times you are available, generate bookable time slots, and manage your confirmed appointments.',
    badge: 'Start here',
  },
  {
    icon: Users,
    label: 'My Patients',
    href: '/dashboard/patients',
    color: 'bg-green-100 text-green-700',
    description: 'View patients you have served and their details.',
  },
  {
    icon: FileText,
    label: 'Care Reports',
    href: '/dashboard/reports',
    color: 'bg-orange-100 text-orange-700',
    description: 'Submit care reports after each completed session. Reports unlock your earnings for withdrawal.',
    badge: 'Required for payment',
  },
  {
    icon: CreditCard,
    label: 'Earnings',
    href: '/dashboard/earnings',
    color: 'bg-emerald-100 text-emerald-700',
    description: 'Track your total earnings, available balance, and locked amounts waiting for care reports.',
  },
  {
    icon: Wallet,
    label: 'Withdrawals',
    href: '/dashboard/withdrawals',
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Request withdrawals of your available balance directly to your mobile money or bank account.',
  },
];

const CaregiverOnboardingDialog = ({ open, onClose }: Props) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = overview, 1+ = page detail

  const handleNavigate = (href: string) => {
    onClose();
    navigate(href);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-primary" />
            Welcome to TunzaConnect!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Here's a quick overview of everything available to you as a caregiver.
          </p>

          <div className="grid gap-3">
            {pages.map((page) => {
              const Icon = page.icon;
              return (
                <button
                  key={page.href}
                  onClick={() => handleNavigate(page.href)}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 text-left transition-colors w-full group"
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${page.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{page.label}</span>
                      {page.badge && (
                        <Badge variant="secondary" className="text-xs h-4 px-1.5">
                          {page.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{page.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-800">Quick start tip</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Go to <strong>Schedule</strong> first — set your availability and generate time slots so patients can start booking you.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Dismiss
            </Button>
            <Button className="flex-1 gap-2" onClick={() => handleNavigate('/dashboard/schedule')}>
              <Calendar className="h-4 w-4" />
              Go to Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CaregiverOnboardingDialog;
