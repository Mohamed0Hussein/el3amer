// import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
// import { useEffect, useState } from 'react';

// Note: You'll need to install @react-native-community/netinfo
// Run: npx expo install @react-native-community/netinfo

export interface NetworkStatus {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string;
}

export const useNetworkStatus = () => {
  // Mocked implementation to bypass native module issues
  /*
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    return () => unsubscribe();
  }, []);

  return networkStatus;
  */

  return { isConnected: true, isInternetReachable: true, type: 'wifi' };
};

export default useNetworkStatus;
