import axios from 'axios';

export interface DonationRequest {//Типизация запроса
  order_id: number;
  amount: number;
  name?: string;
  email?: string;
}

export interface DonationResponse {
  id: number;
  order_id: number;
  amount: number;
  user_id?: number;
  creator_name?: string;
  created_at: string;
}

export async function submitDonation(donation: DonationRequest): Promise<DonationResponse> {
  const token = localStorage.getItem('token');//берем jwt
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;//если автор добавл
  }
  console.log('Donation request payload:', donation);
  const response = await axios.post<DonationResponse>('/api/donations', donation, {
    headers,
  });
  console.log('Donation request response:', response);

  return response.data;
}
