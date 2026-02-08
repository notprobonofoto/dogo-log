import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';

type PushStatus = 'loading' | 'enabled' | 'disabled' | 'denied' | 'unsupported';

// Get VAPID public key from environment or use placeholder
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getDeviceId(): string {
  const key = 'dogolog_device_id';
  let deviceId = localStorage.getItem(key);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(key, deviceId);
  }
  return deviceId;
}

export function usePushNotifications() {
  const { profileId } = useApp();
  const [status, setStatus] = useState<PushStatus>('loading');
  const [isRegistering, setIsRegistering] = useState(false);
  const deviceId = getDeviceId();

  // Check current push status
  useEffect(() => {
    async function checkStatus() {
      // Check if push is supported
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setStatus('unsupported');
        return;
      }

      // Check notification permission
      const permission = Notification.permission;
      if (permission === 'denied') {
        setStatus('denied');
        return;
      }

      // Check if we have an active subscription in database
      if (!profileId) {
        setStatus('disabled');
        return;
      }

      try {
        const { data } = await supabase
          .from('push_subscriptions')
          .select('enabled')
          .eq('profile_id', profileId)
          .eq('device_id', deviceId)
          .maybeSingle();

        if (data?.enabled) {
          setStatus('enabled');
        } else {
          setStatus('disabled');
        }
      } catch (err) {
        console.error('Error checking push status:', err);
        setStatus('disabled');
      }
    }

    checkStatus();
  }, [profileId, deviceId]);

  // Register for push notifications
  const registerPush = useCallback(async (): Promise<boolean> => {
    if (!profileId || !VAPID_PUBLIC_KEY) {
      console.error('Missing profileId or VAPID key');
      return false;
    }

    setIsRegistering(true);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        setIsRegistering(false);
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      await navigator.serviceWorker.ready;

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      });

      const subscriptionJSON = subscription.toJSON();
      
      // Save to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          profile_id: profileId,
          device_id: deviceId,
          endpoint: subscriptionJSON.endpoint || '',
          keys: {
            p256dh: subscriptionJSON.keys?.p256dh || '',
            auth: subscriptionJSON.keys?.auth || ''
          },
          enabled: true,
          last_seen_at: new Date().toISOString()
        }, {
          onConflict: 'profile_id,device_id'
        });

      if (error) {
        console.error('Error saving subscription:', error);
        setIsRegistering(false);
        return false;
      }

      setStatus('enabled');
      setIsRegistering(false);
      return true;
    } catch (err) {
      console.error('Error registering push:', err);
      setIsRegistering(false);
      return false;
    }
  }, [profileId, deviceId]);

  // Unsubscribe from push notifications
  const unsubscribePush = useCallback(async (): Promise<boolean> => {
    if (!profileId) return false;

    try {
      // Get service worker registration
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      // Mark as disabled in database
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ enabled: false })
        .eq('profile_id', profileId)
        .eq('device_id', deviceId);

      if (error) {
        console.error('Error updating subscription:', error);
        return false;
      }

      setStatus('disabled');
      return true;
    } catch (err) {
      console.error('Error unsubscribing:', err);
      return false;
    }
  }, [profileId, deviceId]);

  // Send test push notification
  const sendTestPush = useCallback(async (): Promise<boolean> => {
    if (!profileId) return false;

    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: 'Test DogoLog 🐾',
          body: 'Powiadomienia push działają poprawnie!',
          type: 'test',
          targetProfileIds: [profileId]
        }
      });

      if (error) {
        console.error('Error sending test push:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error sending test push:', err);
      return false;
    }
  }, [profileId]);

  return {
    status,
    isRegistering,
    deviceId,
    registerPush,
    unsubscribePush,
    sendTestPush,
    isSupported: status !== 'unsupported',
    isEnabled: status === 'enabled',
    isDenied: status === 'denied'
  };
}
