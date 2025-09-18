import { useRef, useEffect, useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { supabase } from '../../types/supabaseclient'; // update the path if needed

const DEFAULT_BANNER = '/images/default-banner.jpg';
const DEFAULT_PROFILE_PHOTO = '/images/default-pp.jpg';

interface ProfileHeaderProps {
  name: string;
  profilePhoto: string;
  bannerPhoto: string;
  onEditBanner: () => void;
  onPhotoUpdated: (newUrl: string) => void;
}

const ProfileHeader = ({ 
  name, 
  profilePhoto = DEFAULT_PROFILE_PHOTO, 
  bannerPhoto = DEFAULT_BANNER, 
  onEditBanner, 
  onPhotoUpdated
}: ProfileHeaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // Optional: Replace spaces and add a timestamp for uniqueness
  const filePath = `uploads/${Date.now()}_${file.name.replace(/\s+/g, '-')}`;

  const { error } = await supabase.storage
    .from('profile-photos')
    .upload(filePath, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('❌ Upload failed:', error.message);
    return;
  }

  const { data } = supabase
    .storage
    .from('profile-photos')
    .getPublicUrl(filePath);

  if (data?.publicUrl) {
    onPhotoUpdated(data.publicUrl); // updates the image in parent component
  }
}

  return (
    <div className="relative h-64 w-full">
      {/* Banner */}
      <div className="h-full w-full">
        <img 
          src={bannerPhoto || DEFAULT_BANNER} 
          alt="Profile Banner" 
          className="h-full w-full object-cover"
          onError={(e) => (e.currentTarget.src = DEFAULT_BANNER)}
        />
      </div>

      {/* Banner Edit */}
      <button 
        onClick={onEditBanner}
        className="absolute top-4 right-4 bg-gray-800/70 p-2 rounded-full text-white hover:bg-gray-700/70"
      >
        <FiEdit2 size={20} />
      </button>

      {/* Profile Photo */}
      <div className="absolute -bottom-16 left-8 h-32 w-32 rounded-full border-4 border-gray-900 overflow-hidden">
        <img 
          src={profilePhoto} 
          alt={name} 
          className="h-full w-full object-cover"
          onError={(e) => (e.currentTarget.src = DEFAULT_PROFILE_PHOTO)}
        />
        
        <input 
          type="file" 
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default ProfileHeader;