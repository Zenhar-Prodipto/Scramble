import { Gender, UsageType } from "../schemas/users.schema";

// Interface for user response data
export interface UserResponseData {
  user: {
    id: string;
    email: string;
    name: string;
    gender: Gender;
    avatar: string;
    usageType: UsageType;
    company?: string;
    lastLogin: Date | null;
    isActive: boolean;
    projects: string[];
  };
}
