export interface Location {
  country: string;
  city: string;
  code: string | null;
  street: string | null;
}

export interface Route {
  from: Location;
  to: Location;
}
