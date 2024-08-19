import type { Location } from './Route.ts';

export interface User {
  id: string;
  name: string;
  email: string;
  location: Location;
  locale: string;
  salt: string;
  password: string;
  orderIds: string[];
  deliveryIds: string[];
}
