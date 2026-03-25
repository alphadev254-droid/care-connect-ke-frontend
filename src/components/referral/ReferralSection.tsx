import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Share2,
  Mail,
  Copy,
  MessageCircle,
  TrendingUp,
  Users,
  Award,
  Loader2
} from 'lucide-react';

export const ReferralSection = () => {
  const [emailRecipient, setEmailRecipient] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');

  // Fetch referral code and stats
  const { data: referralData, isLoading } = useQuery({
    queryKey: ['referral-code'],
    queryFn: async () => {
      const response = await api.get('/caregivers/referral/code');
      return response.data;
    }
  });

  // Copy to clipboard
  const handleCopyLink = () => {
    if (!referralData?.referralLink) return;
    navigator.clipboard.writeText(referralData.referralLink);
    toast.success('Referral link copied!');
  };

  // Copy code only
  const handleCopyCode = () => {
    if (!referralData?.referralCode) return;
    navigator.clipboard.writeText(referralData.referralCode);
    toast.success('Referral code copied!');
  };

  // WhatsApp share
  const handleWhatsAppShare = () => {
    if (!referralData) return;

    const message = encodeURIComponent(
      `Hi! I'm a verified healthcare caregiver on TunzaConnect. ` +
      `I'd like to recommend this platform to you - whether you're looking for quality home healthcare services or you're a fellow caregiver wanting to join!\n\n` +
      `Sign up using my referral link: ${referralData.referralLink}\n\n` +
      `Or use code: ${referralData.referralCode}`
    );

    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // Email share mutation
  const emailMutation = useMutation({
    mutationFn: async (data: { recipientEmail: string; personalMessage: string }) => {
      const response = await api.post('/caregivers/referral/send-email', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Referral email sent!');
      setEmailRecipient('');
      setPersonalMessage('');
    },
    onError: () => {
      toast.error('Failed to send email');
    }
  });

  const handleSendEmail = () => {
    if (!emailRecipient) {
      toast.error('Please enter an email');
      return;
    }

    if (!emailRecipient.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    emailMutation.mutate({
      recipientEmail: emailRecipient,
      personalMessage
    });
  };

  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardContent className="pt-6 flex items-center justify-center min-h-[150px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950/20 pb-3 px-4">
        <CardTitle className="font-display flex items-center gap-2 text-base sm:text-lg">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="leading-tight">Refer & Earn</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 px-4 space-y-4 sm:space-y-5">
        {/* Stats Section - Responsive Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-primary" />
            <p className="text-lg sm:text-xl font-bold">{referralData?.stats?.totalConverted || 0}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Referrals</p>
          </div>
          <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-green-600" />
            <p className="text-lg sm:text-xl font-bold">{referralData?.stats?.boostScore || 0}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Boost</p>
          </div>
          <div className="text-center p-2 sm:p-3 rounded-lg bg-muted/50">
            <Award className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 text-amber-600" />
            <p className="text-lg sm:text-xl font-bold">
              {(referralData?.stats?.boostScore || 0) > 0 ? '⭐' : '–'}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Ranking</p>
          </div>
        </div>

        {/* Referral Code Display - Compact */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-2 border-purple-200 dark:border-purple-800 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground">Your Code</p>
            <Badge variant="secondary" className="font-mono text-xs">
              {referralData?.referralCode}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={referralData?.referralLink || ''}
              readOnly
              className="font-mono text-[10px] sm:text-xs bg-white dark:bg-slate-900 h-8"
            />
            <Button size="sm" variant="outline" onClick={handleCopyLink} className="h-8 w-8 p-0">
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Quick Share Buttons - Responsive */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-9"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
            <span className="hidden sm:inline">WhatsApp</span>
            <span className="sm:hidden">Share</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-9"
            onClick={handleCopyCode}
          >
            <Copy className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Copy Code</span>
            <span className="sm:hidden">Copy</span>
          </Button>
        </div>

        {/* Email Referral Form - Collapsible on Mobile */}
        <details className="border-t pt-3">
          <summary className="cursor-pointer font-semibold text-sm flex items-center gap-2 hover:text-primary">
            <Mail className="h-4 w-4 text-primary" />
            Send via Email
          </summary>
          <div className="mt-3 space-y-2.5">
            <div>
              <label className="text-xs font-medium mb-1 block">
                Recipient Email
              </label>
              <Input
                type="email"
                placeholder="recipient@example.com"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                className="text-sm h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">
                Message (Optional)
              </label>
              <Textarea
                placeholder="Add a personal note..."
                rows={2}
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                className="text-sm resize-none"
              />
            </div>
            <Button
              size="sm"
              className="w-full gap-1.5 h-9"
              onClick={handleSendEmail}
              disabled={emailMutation.isPending}
            >
              {emailMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-3.5 w-3.5" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </details>

        {/* How It Works - Compact */}
        <details className="border-t pt-3">
          <summary className="cursor-pointer text-xs font-semibold hover:text-primary">
            How It Works
          </summary>
          <ol className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-semibold text-primary">1.</span>
              Share your code or link
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary">2.</span>
              Patient or caregiver registers with your code
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary">3.</span>
              You get +1 boost score per conversion
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-primary">4.</span>
              Higher ranking = more visibility
            </li>
          </ol>
        </details>
      </CardContent>
    </Card>
  );
};
