import type { Route } from './Route.ts';

export interface Request {
  id: string;
  type: 'order' | 'delivery';
  route: Route;
  parcel: string;
  description: string;
  userId: string;
  status: string;
  createdAt: string;
  dispatchedAt: string | null;
  receivedAt: string | null;
}
