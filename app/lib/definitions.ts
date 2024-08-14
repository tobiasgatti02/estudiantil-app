// /app/lib/definitions.ts

export type User = {
  id: string;         
  name: string;
  email: string;
  password: string;  
  role: 'owner' | 'admin' | 'teacher' | 'student'; 
  dni: string;
  created_at: string; 
  updated_at: string;
};
