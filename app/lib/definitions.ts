// /app/lib/definitions.ts

export type User = {
  user_id: number;      
  name: string;
  password: string;  
  user_type: 'owner' | 'admin' | 'teacher' | 'student'; 
  dni: string;
};
