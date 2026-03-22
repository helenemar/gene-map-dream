import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { getRedirectOrigin } from '@/utils/redirectUrl';
import { toast } from 'sonner';
import gogyIcon from '@/assets/genogy-icon.svg';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profession, setProfession] = useState('');
  const [phone, setPhone] = useState('');
  const [siren, setSiren] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [sendingPassword, setSendingPassword] = useState(false);
  const [passwordSent, setPasswordSent] = useState(false);

  const email = user?.email ?? '';

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setFirstName((data as any).first_name ?? '');
        setLastName((data as any).last_name ?? '');
        setProfession((data as any).profession ?? '');
        setPhone((data as any).phone ?? '');
        setSiren((data as any).siren ?? '');
        setBillingAddress((data as any).billing_address ?? '');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    if (!firstName.trim() || !lastName.trim()) {
      toast.error(t.account.requiredFields);
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        profession,
        phone,
        siren,
        billing_address: billingAddress,
      } as any)
      .eq('user_id', user.id);

    if (error) {
      toast.error(t.account.saveError);
    } else {
      toast.success(t.account.profileUpdated);
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    toast.success(t.account.deleteRequested);
    await signOut();
    navigate('/');
  };

  const handlePasswordReset = async () => {
    setSendingPassword(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getRedirectOrigin()}/reset-password`,
    });
    if (error) {
      toast.error(t.account.emailSendError);
    } else {
      setPasswordSent(true);
    }
    setSendingPassword(false);
  };

  const [exporting, setExporting] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      const { data: genograms } = await supabase.from('genograms').select('*').eq('user_id', user.id);
      const exportPayload = {
        exportDate: new Date().toISOString(),
        user: { id: user.id, email: user.email },
        profile,
        genograms,
      };
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `genogy-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t.account.exportSuccess);
    } catch {
      toast.error(t.account.exportError);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-card flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t.common.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-card">
      <header className="h-[64px] bg-card border-b border-border flex items-center justify-between px-8">
        <a href="/dashboard" className="flex items-center gap-2.5">
          <img src={gogyIcon} alt="Genogy" className="w-8 h-8" />
          <span className="text-[15px] font-semibold text-foreground tracking-tight">Genogy</span>
        </a>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t.account.myAccount}
        </button>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-6 px-0 h-auto pb-0">
            <TabsTrigger value="profile" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm font-medium">
              {t.account.myProfile}
            </TabsTrigger>
            <TabsTrigger value="danger" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm font-medium">
              {t.account.settings}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-8">
            <div className="border border-border rounded-xl p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">{t.account.firstName} <span className="text-destructive">*</span></Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder={t.account.firstName} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">{t.account.lastName} <span className="text-destructive">*</span></Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder={t.account.lastName} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">{t.account.professionLabel}</Label>
                <Input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder={t.account.professionLabel} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">{t.account.emailLabel} <span className="text-destructive">*</span></Label>
                  <Input value={email} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">{t.account.phoneLabel}</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">{t.account.sirenLabel}</Label>
                  <Input value={siren} onChange={(e) => setSiren(e.target.value)} placeholder="123 456 789" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">{t.account.billingLabel}</Label>
                  <Input value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} placeholder={t.account.billingLabel} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>{t.common.cancel}</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? t.account.saving : t.account.saveChanges}</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="danger" className="mt-8 space-y-6">
            <div className="border border-border rounded-xl p-6">
              <h3 className="text-base font-semibold text-foreground mb-1">{t.account.exportData}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.account.exportDataDesc}</p>
              <Button variant="outline" disabled={exporting} onClick={handleExportData} className="gap-2">
                <Download className="w-4 h-4" />
                {exporting ? t.account.exporting : t.account.exportData}
              </Button>
            </div>


            <div className="border border-border rounded-xl p-6">
              <h3 className="text-base font-semibold text-foreground mb-1">{t.account.changePassword}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.account.changePasswordDesc}</p>
              <div className="flex flex-col gap-3">
                {passwordSent ? (
                  <p className="text-sm text-primary font-medium">{t.account.emailSent}</p>
                ) : (
                  <Button variant="outline" disabled={sendingPassword} onClick={handlePasswordReset}>
                    {sendingPassword ? t.account.sendingLink : t.account.sendResetLink}
                  </Button>
                )}
              </div>
            </div>

            <div className="border border-destructive/30 rounded-xl p-6">
              <h3 className="text-base font-semibold text-foreground mb-1">{t.account.deleteAccount}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.account.deleteAccountDesc}</p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">{t.account.deleteAccount}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.account.deleteAccountConfirmTitle}</AlertDialogTitle>
                    <AlertDialogDescription>{t.account.deleteAccountConfirmDesc}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {t.account.yesDelete}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Account;
