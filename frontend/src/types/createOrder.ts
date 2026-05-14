export interface Service {
  id: number;
  name: string;
  price: number;
}

export interface SelectedService {
  id: number;
  price: number;
  description: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
}
