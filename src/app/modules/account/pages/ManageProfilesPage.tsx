import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Edit3, Eraser, LogIn, Plus, Trash2, UserRoundCog, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@app/contexts/AuthContext';
import { AccountSubMenu } from '@app/components/AccountSubMenu';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Input } from '@app/components/ui/input';
import { Label } from '@app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import {
  organizationProfileService,
  type OrganizationProfile,
  type OrganizationProfileStatus,
} from '@app/services/organizationProfileService';
import { savedSearchService } from '@app/services/savedSearchService';

interface ProfileFormState {
  fullName: string;
  email: string;
  status: OrganizationProfileStatus;
}

const emptyForm: ProfileFormState = {
  fullName: '',
  email: '',
  status: 'active',
};

export default function ManageProfilesPage() {
  const navigate = useNavigate();
  const { activeOrganizationProfile, setActiveOrganizationProfile } = useAuth();
  const [profiles, setProfiles] = useState<OrganizationProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<OrganizationProfile | null>(null);
  const [form, setForm] = useState<ProfileFormState>(emptyForm);

  const activeProfiles = useMemo(() => profiles.filter((profile) => profile.status === 'active').length, [profiles]);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const nextProfiles = await organizationProfileService.list();
      setProfiles(nextProfiles);
    } catch (error) {
      toast.error('Organization profiles could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const openCreateDialog = () => {
    setEditingProfile(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (profile: OrganizationProfile) => {
    setEditingProfile(profile);
    setForm({
      fullName: profile.fullName,
      email: profile.email,
      status: profile.status,
    });
    setDialogOpen(true);
  };

  const saveProfile = async () => {
    const fullName = form.fullName.trim();
    const email = form.email.trim();
    if (!fullName || !email) {
      toast.error('Full name and email are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingProfile) {
        const updated = await organizationProfileService.update(editingProfile.id, { fullName, email, status: form.status });
        setProfiles((current) => current.map((profile) => profile.id === updated.id ? updated : profile));
        if (activeOrganizationProfile?.id === updated.id) {
          setActiveOrganizationProfile(updated);
        }
        toast.success('Profile updated');
      } else {
        const created = await organizationProfileService.create({ fullName, email, status: form.status });
        setProfiles((current) => [created, ...current]);
        toast.success('Profile created');
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error('Profile could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (profile: OrganizationProfile) => {
    const nextStatus: OrganizationProfileStatus = profile.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await organizationProfileService.setStatus(profile.id, nextStatus);
      setProfiles((current) => current.map((item) => item.id === updated.id ? updated : item));
      if (nextStatus === 'inactive' && activeOrganizationProfile?.id === profile.id) {
        setActiveOrganizationProfile(null);
      }
      toast.success(nextStatus === 'active' ? 'Profile activated' : 'Profile deactivated');
    } catch {
      toast.error('Profile status could not be changed.');
    }
  };

  const clearProfileData = async (profile: OrganizationProfile) => {
    try {
      await organizationProfileService.clearData(profile.id);
      savedSearchService.removeByOrganizationProfile(profile.id);
      setProfiles((current) => current.map((item) => (
        item.id === profile.id ? { ...item, savedSearchCount: 0, alertCount: 0 } : item
      )));
      toast.success('Profile data cleared');
    } catch {
      toast.error('Profile data could not be cleared.');
    }
  };

  const deleteProfile = async (profile: OrganizationProfile) => {
    try {
      await organizationProfileService.remove(profile.id);
      savedSearchService.removeByOrganizationProfile(profile.id);
      setProfiles((current) => current.filter((item) => item.id !== profile.id));
      if (activeOrganizationProfile?.id === profile.id) {
        setActiveOrganizationProfile(null);
      }
      toast.success('Profile deleted');
    } catch {
      toast.error('Profile could not be deleted.');
    }
  };

  const accessProfile = async (profile: OrganizationProfile) => {
    if (profile.status !== 'active') {
      toast.error('Inactive profiles cannot be accessed.');
      return;
    }

    try {
      const accessed = await organizationProfileService.access(profile.id);
      setActiveOrganizationProfile(accessed);
      navigate('/account/my-selection');
    } catch {
      toast.error('Profile workspace could not be opened.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        icon={UsersRound}
        title="Manage Profiles"
        description="Create, access, and manage organization user profiles for profile-specific searches and alerts."
      />
      <AccountSubMenu activeTab="manage-profiles" onTabChange={() => undefined} mode="profile-settings" />

      <PageContainer className="my-6">
        <div className="space-y-6 px-4 py-6 sm:px-5 lg:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Total profiles</p><p className="mt-1 text-2xl font-semibold text-primary">{profiles.length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Active profiles</p><p className="mt-1 text-2xl font-semibold text-primary">{activeProfiles}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Current workspace</p><p className="mt-1 truncate text-lg font-semibold text-primary">{activeOrganizationProfile?.fullName || 'None selected'}</p></CardContent></Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRoundCog className="h-5 w-5 text-primary" />
                Organization Profiles
              </CardTitle>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Create profile
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading profiles...</p>
              ) : profiles.length === 0 ? (
                <div className="rounded-lg border border-dashed p-10 text-center">
                  <UsersRound className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                  <p className="font-semibold text-primary">No profiles yet</p>
                  <p className="mt-1 text-sm text-gray-500">Create the first profile to start isolating searches and alerts.</p>
                  <Button className="mt-4" onClick={openCreateDialog}>Create profile</Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {profiles.map((profile) => (
                    <article key={profile.id} className="rounded-lg border bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-primary">{profile.fullName}</h3>
                            <Badge className={profile.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}>
                              {profile.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                            {activeOrganizationProfile?.id === profile.id && <Badge variant="outline">Current workspace</Badge>}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{profile.email}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                            <span>{profile.savedSearchCount ?? 0} saved searches</span>
                            <span>{profile.alertCount ?? 0} alerts</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => accessProfile(profile)} disabled={profile.status !== 'active'}>
                            <LogIn className="h-4 w-4" />
                            Profile Access
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(profile)}>
                            <Edit3 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleStatus(profile)}>
                            {profile.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => clearProfileData(profile)}>
                            <Eraser className="h-4 w-4" />
                            Clear data
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteProfile(profile)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProfile ? 'Edit profile' : 'Create profile'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(status: OrganizationProfileStatus) => setForm((current) => ({ ...current, status }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveProfile} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save profile'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
