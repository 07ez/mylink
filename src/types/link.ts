export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  isActive: boolean;
  isPrimary?: boolean;
  icon?: string;
  order: number;
  createdAt?: string;
}

export interface UserProfile {
  uid?: string;
  username: string;
  name: string;
  title: string;
  bio: string;
  avatarText: string;
  photoURL?: string;
  email?: string;
  chips: string[];
}

export interface MyLinkData {
  user: UserProfile;
  links: LinkItem[];
}
