import { router } from 'expo-router';

export function goBack(fallback = '/dashboard') {
  try {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback as '/dashboard');
    }
  } catch {
    router.replace(fallback as '/dashboard');
  }
}

function goHome() {
  if (router.canGoBack()) {
    router.dismissAll();
  }
  router.replace('/dashboard');
}

export { goHome };
