export interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  isActive: boolean;
  isPrimary?: boolean;
  icon?: string;
  order: number;
}

export interface UserProfile {
  username: string;
  name: string;
  title: string;
  bio: string;
  avatarText: string;
  chips: string[];
}

export interface MyLinkData {
  user: UserProfile;
  links: LinkItem[];
}
