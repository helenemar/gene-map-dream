import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FamilyMember, Union, EmotionalLink } from '@/types/genogram';
import GenogramEditor from './GenogramEditor';
import { AlertCircle } from 'lucide-react';

interface SharedData {
  genogram_id: string;
  genogram_name: string;
  genogram_data: {
    members?: FamilyMember[];
    unions?: Union[];
    emotionalLinks?: EmotionalLink[];
  };
  access_level: 'reader' | 'editor';
}

const SharedEditor: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<SharedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data: result, error: err } = await supabase.rpc('get_shared_genogram', { p_token: token });
      if (err || !result || (Array.isArray(result) && result.length === 0)) {
        setError('Ce lien de partage est invalide ou a expiré.');
        setLoading(false);
        return;
      }
      const row = Array.isArray(result) ? result[0] : result;
      const shared = row as SharedData;
      
      // Only editors can use this page
      if (shared.access_level !== 'editor') {
        navigate(`/shared/${token}`, { replace: true });
        return;
      }
      
      setData(shared);
      setLoading(false);

      // Claim this share for the logged-in user so it appears in their dashboard
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.rpc('claim_shared_genogram', { p_token: token });
      }
    })();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg font-medium text-foreground">{error || 'Génogramme introuvable'}</p>
        <button onClick={() => navigate('/')} className="text-sm text-primary hover:underline">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <GenogramEditor
      shareToken={token!}
      sharedInitialData={{
        name: data.genogram_name,
        members: data.genogram_data?.members || [],
        unions: data.genogram_data?.unions || [],
        emotionalLinks: data.genogram_data?.emotionalLinks || [],
      }}
    />
  );
};

export default SharedEditor;
