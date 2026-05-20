import axios from 'axios';
import { mockCategories, mockCities } from '../mock/reconstruction.mock';

export interface Category {
  id: number;
  name: string;
}

export interface City {
  id: number;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await axios.get<Category[]>('/api/categories', {
      withCredentials: true,
    });
    return data;
  } catch {
    console.warn('Using mock data for categories');
    return mockCategories;
  }
}

export async function getCities(): Promise<City[]> {
  try {
    const { data } = await axios.get<City[]>('/api/cities', {
      withCredentials: true,
    });
    return data;
  } catch  {
    console.warn('Using mock data for cities');
    return mockCities;
  }
}
