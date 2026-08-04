import axios from 'axios';
import { toast } from 'sonner-native';

export function handleApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const message =
        (error.response.data as any)?.error?.message ?? `Request failed (${error.response.status})`;
      toast.error(message);
      console.log('API Error:', error.response.status, error.response.data);
      return;
    }

    if (error.request) {
      toast.error('Network error. Please check your internet connection.');
      console.log('Network Error:', error.message);
      return;
    }

    toast.error(error.message);
    console.log('Axios Error:', error.message);
    return;
  }

  toast.error('An unexpected error occurred.');
  console.error(error);
}
