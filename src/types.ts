export  interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string[];
  releaseYear: number;
  rating: number;
  duration: string;
  posterUrl: string;
  videoUrl: string;
  featured: boolean;
  createdAt: any;
}

export interface User {
  uid: string;
  email: string;
  isAdmin: boolean;
  preferences?: {
    darkMode: boolean;
    emailNotifications: boolean;
    themeOpacity?: number;
  };
}
 