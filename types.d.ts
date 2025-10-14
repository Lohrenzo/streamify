
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
