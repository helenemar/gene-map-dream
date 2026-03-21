import React, { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Camera, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MemberAvatarUploadProps {
  memberId: string;
  genogramId: string;
  currentAvatar?: string;
  onAvatarChange: (url: string | undefined) => void;
  size?: number;
  disabled?: boolean;
}

const MemberAvatarUpload: React.FC<MemberAvatarUploadProps> = ({
  memberId,
  genogramId,
  currentAvatar,
  onAvatarChange,
  size = 56,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5 Mo');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${genogramId}/${memberId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('member-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('member-avatars')
        .getPublicUrl(filePath);

      // Add cache-bust to force refresh
      onAvatarChange(`${publicUrl}?t=${Date.now()}`);
      toast.success('Photo ajoutée');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onAvatarChange(undefined);
    toast.success('Photo retirée');
  };

  return (
    <div className="relative group" style={{ width: size, height: size }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
      />

      {currentAvatar ? (
        <div
          className="w-full h-full rounded-xl overflow-hidden cursor-pointer border border-border/50 hover:border-primary/50 transition-colors"
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <img
            src={currentAvatar}
            alt="Photo membre"
            className="w-full h-full object-cover"
          />
          {!disabled && (
            <button
              onClick={handleRemove}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full h-full rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 flex items-center justify-center transition-colors bg-muted/20 hover:bg-muted/40 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-muted-foreground/60" />
          )}
        </button>
      )}
    </div>
  );
};

export default MemberAvatarUpload;
