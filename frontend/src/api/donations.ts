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

export interface DonationCheckoutResponse {
  url: string;
  session_id: string;
}

function donationHeaders() {
  const token = localStorage.getItem('token');//берем jwt
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;//если автор добавл
  }

  return headers;
}

export async function submitDonation(donation: DonationRequest): Promise<DonationResponse> {
  console.log('Donation request payload:', donation);
  const response = await axios.post<DonationResponse>('/api/donations', donation, {
    headers: donationHeaders(),
  });
  console.log('Donation request response:', response);

  return response.data;
}

export async function createDonationCheckout(donation: DonationRequest): Promise<DonationCheckoutResponse> {
  const response = await axios.post<DonationCheckoutResponse>('/api/donations/checkout', donation, {
    headers: donationHeaders(),
  });

  return response.data;
}
