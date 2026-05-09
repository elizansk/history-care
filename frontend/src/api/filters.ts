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
    const res = await fetch('/api/categories', {
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('API not available');
    }
    var data = await res.json();
    return data;
  } catch (error) {
    console.warn('Using mock data for categories');
    return mockCategories;
  }
}

export async function getCities(): Promise<City[]> {
  try {
    const res = await fetch('/api/auth/cities', {
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('API not available');
    }
    var data = await res.json();
    return data;
  } catch (error) {
    console.warn('Using mock data for cities');
    return mockCities;
  }
}