/**
 * Hook that tracks whether the device has an internet connection.
 * Used to show offline banners and disable AI features gracefully.
 */
import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isChecking: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true, // Assume connected until proven otherwise
    isChecking: true,
  });

  useEffect(() => {
    // Check immediately on mount
    NetInfo.fetch().then((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? true,
        isChecking: false,
      });
    });

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? true,
        isChecking: false,
      });
    });

    return unsubscribe;
  }, []);

  return status;
}
