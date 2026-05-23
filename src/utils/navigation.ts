import { router } from 'expo-router';

export function goBack(fallback = '/dashboard') {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback as '/dashboard');
  }
}
