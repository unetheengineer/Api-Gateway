// Extend Express Request to include user property
declare namespace Express {
  export interface Request {
    user?: {
      userId: string;
      email: string;
      firstName?: string;
      lastName?: string;
      roles?: string[];
    };
  }
}
