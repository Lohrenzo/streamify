/**
 * Global ambient type declarations for third-party libs and app models.
 */
declare module "selectpdf" {
  const selectpdf: any;
  export default selectpdf;
}

interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
}

interface User {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  email_verified: Date | null;
  image: string | null;
  password: string | null;
  dob: Date | null;
  created_at: Date;
  updated_at: Date;
  accounts: Account[]
}

/**
 * @interface VideoMetadata
 * @description Defines the structure for video metadata passed to the client component.
 * @property {string} id - Unique identifier for the video.
 * @property {string} title - Display title of the video.
 * @property {string} manifestUrl - URL to the HLS manifest for streaming.
 * @property {Date} uploadDate - The date when the video was uploaded.
 * @property {string} thumbnailUrl - URL to the video's thumbnail image.
 * @property {string} userId - The user who uploaded the video.
 */
interface VideoMetadata {
  id: string;
  title: string;
  manifestUrl: string;
  uploadDate: Date;
  thumbnailUrl: string;
  userId: string;
}

/**
 * @interface VideoPlayerClientProps
 * @description Props for the VideoPlayerClient component.
 * @property {VideoMetadata} video - The video metadata object to be displayed and played.
 */
interface VideoPlayerClientProps {
  video: VideoMetadata;
}
