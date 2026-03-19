import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api';
import { dashboardCard, responsive } from '@/theme';
import {
  Settings,
  Video,
  Users,
  BarChart3,
  RefreshCw,
  Trash2,
  Eye,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const TeleconferenceAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('sessions');
  const [loading, setLoading] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<any>({});

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsPagination, setSessionsPagination] = useState<any>({});
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionFilter, setSessionFilter] = useState('');

  // Statistics State
  const [statistics, setStatistics] = useState<any>({});

  // Load settings
  const loadSettings = async () => {
    try {
      const response = await api.get('/meeting/settings');
      setSettings(response.data.settings || {});
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Load sessions
  const loadSessions = async (page = 1, status = '') => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (status) params.status = status;

      const response = await api.get('/meeting/sessions', { params });
      setSessions(response.data.sessions || []);
      setSessionsPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    try {
      const response = await api.get('/meeting/statistics');
      setStatistics(response.data.statistics || {});
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // Save settings
  const saveSettings = async () => {
    setLoading(true);
    try {
      await api.put('/meeting/settings', settings);
      toast({
        title: 'Success',
        description: 'Settings saved successfully'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Regenerate meeting tokens
  const regenerateTokens = async (appointmentId: number) => {
    if (!confirm('Are you sure you want to regenerate meeting tokens? Old links will stop working.')) {
      return;
    }

    try {
      const response = await api.post(`/meeting/sessions/${appointmentId}/regenerate-tokens`);
      toast({
        title: 'Success',
        description: 'Meeting tokens regenerated successfully'
      });
      loadSessions(sessionsPage, sessionFilter);
    } catch (error) {
      console.error('Error regenerating tokens:', error);
      toast({
        title: 'Error',
        description: 'Failed to regenerate tokens',
        variant: 'destructive'
      });
    }
  };

  // Delete session
  const deleteSession = async (sessionId: number) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/meeting/sessions/${sessionId}`);
      toast({
        title: 'Success',
        description: 'Session deleted successfully'
      });
      loadSessions(sessionsPage, sessionFilter);
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        variant: 'destructive'
      });
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Link copied to clipboard'
    });
  };

  useEffect(() => {
    loadSettings();
    loadSessions();
    loadStatistics();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: any = {
      'active': { variant: 'default', icon: Clock, label: 'Active' },
      'completed': { variant: 'secondary', icon: CheckCircle2, label: 'Completed' },
      'cancelled': { variant: 'destructive', icon: XCircle, label: 'Cancelled' },
      'scheduled': { variant: 'outline', icon: Clock, label: 'Scheduled' }
    };

    const config = variants[status] || variants['scheduled'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <DashboardLayout userRole={user?.role || 'admin'}>
      <div className="space-y-6">
        <div>
          <h1 className={responsive.pageTitle}>Teleconference Management</h1>
          <p className={responsive.pageSubtitle}>Manage video consultation settings and sessions</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions" className="gap-2">
              <Video className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* SESSIONS TAB */}
          <TabsContent value="sessions" className="space-y-4">
            <Card className={dashboardCard.base}>
              <CardHeader className={dashboardCard.compactHeader}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className={responsive.cardTitle}>Teleconference Sessions</CardTitle>
                    <CardDescription className={responsive.cardDesc}>View and manage all video consultation sessions</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="border rounded px-3 py-2 text-sm"
                      value={sessionFilter}
                      onChange={(e) => {
                        setSessionFilter(e.target.value);
                        loadSessions(1, e.target.value);
                      }}
                    >
                      <option value="">All Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Button onClick={() => loadSessions(sessionsPage, sessionFilter)} size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden">
                <div className={dashboardCard.tableWrapper}>
                  <Table className={dashboardCard.tableMinWidth}>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Caregiver</TableHead>
                        <TableHead>Specialty</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Participants</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              <p className="text-sm text-muted-foreground">Loading sessions...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : sessions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                            No sessions found
                          </TableCell>
                        </TableRow>
                      ) : (
                        sessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell className="font-mono text-sm">#{session.id}</TableCell>
                            <TableCell>{session.patient_name || 'N/A'}</TableCell>
                            <TableCell>{session.caregiver_name || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{session.specialty_name || 'General'}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {session.scheduledDate ? new Date(session.scheduledDate).toLocaleString() : 'N/A'}
                            </TableCell>
                            <TableCell>{session.total_duration_seconds ? `${Math.floor(session.total_duration_seconds / 60)} min` : '-'}</TableCell>
                            <TableCell>{getStatusBadge(session.session_status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{session.participant_count || 0}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`/dashboard/admin/teleconference/session/${session.id}`, {
                                    state: { session }
                                  })}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => regenerateTokens(session.appointmentId)}
                                  title="Regenerate Tokens"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteSession(session.id)}
                                  title="Delete Session"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {sessionsPagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {sessionsPagination.page} of {sessionsPagination.pages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={sessionsPagination.page === 1}
                        onClick={() => {
                          const newPage = sessionsPage - 1;
                          setSessionsPage(newPage);
                          loadSessions(newPage, sessionFilter);
                        }}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={sessionsPagination.page === sessionsPagination.pages}
                        onClick={() => {
                          const newPage = sessionsPage + 1;
                          setSessionsPage(newPage);
                          loadSessions(newPage, sessionFilter);
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-4">
            <Card className={dashboardCard.base}>
              <CardHeader className={dashboardCard.compactHeader}>
                <CardTitle className={responsive.cardTitle}>Meeting Settings</CardTitle>
                <CardDescription className={responsive.cardDesc}>Configure teleconference behavior and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultDuration">Default Duration (minutes)</Label>
                    <Input
                      id="defaultDuration"
                      type="number"
                      value={settings.default_duration || 60}
                      onChange={(e) => setSettings({ ...settings, default_duration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowEarlyJoin">Allow Early Join (minutes)</Label>
                    <Input
                      id="allowEarlyJoin"
                      type="number"
                      value={settings.allow_early_join_minutes || 15}
                      onChange={(e) => setSettings({ ...settings, allow_early_join_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLateJoin">Max Late Join (minutes)</Label>
                    <Input
                      id="maxLateJoin"
                      type="number"
                      value={settings.max_late_join_minutes || 30}
                      onChange={(e) => setSettings({ ...settings, max_late_join_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDuration">Max Meeting Duration (minutes)</Label>
                    <Input
                      id="maxDuration"
                      type="number"
                      value={settings.max_meeting_duration || 180}
                      onChange={(e) => setSettings({ ...settings, max_meeting_duration: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Features</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="recordMeetings">Auto-record Meetings</Label>
                      <Switch
                        id="recordMeetings"
                        checked={settings.record_meetings || false}
                        onCheckedChange={(checked) => setSettings({ ...settings, record_meetings: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireModerator">Require Moderator</Label>
                      <Switch
                        id="requireModerator"
                        checked={settings.require_moderator !== false}
                        onCheckedChange={(checked) => setSettings({ ...settings, require_moderator: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableChat">Enable Chat</Label>
                      <Switch
                        id="enableChat"
                        checked={settings.enable_chat !== false}
                        onCheckedChange={(checked) => setSettings({ ...settings, enable_chat: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableScreenShare">Enable Screen Share</Label>
                      <Switch
                        id="enableScreenShare"
                        checked={settings.enable_screen_share !== false}
                        onCheckedChange={(checked) => setSettings({ ...settings, enable_screen_share: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableRecording">Enable Recording Feature</Label>
                      <Switch
                        id="enableRecording"
                        checked={settings.enable_recording !== false}
                        onCheckedChange={(checked) => setSettings({ ...settings, enable_recording: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="enableVirtualBg">Enable Virtual Background</Label>
                      <Switch
                        id="enableVirtualBg"
                        checked={settings.enable_virtual_background !== false}
                        onCheckedChange={(checked) => setSettings({ ...settings, enable_virtual_background: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoQuality">Video Quality</Label>
                  <select
                    id="videoQuality"
                    className="w-full border rounded px-3 py-2"
                    value={settings.video_quality || 'high'}
                    onChange={(e) => setSettings({ ...settings, video_quality: e.target.value })}
                  >
                    <option value="low">Low (360p)</option>
                    <option value="standard">Standard (480p)</option>
                    <option value="high">High (720p)</option>
                    <option value="ultra">Ultra (1080p)</option>
                  </select>
                </div>

                <Button onClick={saveSettings} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* STATISTICS TAB */}
          <TabsContent value="statistics" className="space-y-4">
            <div className={dashboardCard.compactStatGrid}>
              <Card className={dashboardCard.base}>
                <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1">
                  <CardTitle className={responsive.cardTitle}>Total Sessions</CardTitle>
                  <Video className="h-3.5 w-3.5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3">
                  <div className={dashboardCard.compactStatValue}>{statistics.total_sessions || 0}</div>
                </CardContent>
              </Card>

              <Card className={dashboardCard.base}>
                <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1">
                  <CardTitle className={responsive.cardTitle}>Completed Sessions</CardTitle>
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3">
                  <div className={`${dashboardCard.compactStatValue} text-success`}>{statistics.completed_sessions || 0}</div>
                </CardContent>
              </Card>

              <Card className={dashboardCard.base}>
                <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1">
                  <CardTitle className={responsive.cardTitle}>Active Sessions</CardTitle>
                  <Clock className="h-3.5 w-3.5 text-primary" />
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3">
                  <div className={`${dashboardCard.compactStatValue} text-primary`}>{statistics.active_sessions || 0}</div>
                </CardContent>
              </Card>

              <Card className={dashboardCard.base}>
                <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1">
                  <CardTitle className={responsive.cardTitle}>Avg Duration</CardTitle>
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3">
                  <div className={dashboardCard.compactStatValue}>
                    {statistics.avg_duration ? `${Math.floor(Number(statistics.avg_duration) / 60)} min` : '0 min'}
                  </div>
                </CardContent>
              </Card>

              <Card className={dashboardCard.base}>
                <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1">
                  <CardTitle className={responsive.cardTitle}>Avg Participants</CardTitle>
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3">
                  <div className={dashboardCard.compactStatValue}>
                    {statistics.avg_participants ? Number(statistics.avg_participants).toFixed(1) : '0'}
                  </div>
                </CardContent>
              </Card>

              <Card className={dashboardCard.base}>
                <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 pb-1">
                  <CardTitle className={responsive.cardTitle}>Total Disconnections</CardTitle>
                  <AlertCircle className="h-3.5 w-3.5 text-warning" />
                </CardHeader>
                <CardContent className="px-3 sm:px-4 pb-3">
                  <div className={`${dashboardCard.compactStatValue} text-warning`}>{statistics.total_disconnections || 0}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TeleconferenceAdmin;
