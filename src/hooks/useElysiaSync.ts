import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
// Toast UI not available in this build; use console as fallback

export interface SyncOptions {
  sync_type?: 'all' | 'transactions' | 'accounts' | 'profile';
  limit?: number;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export interface SyncStatus {
  user_id: string;
  last_sync: string | null;
  sync_stats: {
    has_transactions: boolean;
    has_accounts: boolean;
    has_profile: boolean;
  };
}

export function useElysiaSync() {
  const { data: session } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Sync user data with Elysia
  const syncData = useCallback(async (options: SyncOptions = {}) => {
    if (!(session as any)?.user?.id) {
      console.warn('Authentication Required: Please sign in to sync your data');
      return;
    }

    setIsSyncing(true);

    try {
      const response = await fetch('/api/v1/elysia/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sync_type: options.sync_type || 'all',
          limit: options.limit || 500,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      const result = await response.json();

      // Update last sync time
      setLastSyncTime(new Date());

      // Show success message
      console.info(`Data Synchronized: ${options.sync_type || 'all'}`);

      // Call success callback if provided
      if (options.onSuccess) {
        options.onSuccess(result);
      }

      // Fetch updated status
      await getSyncStatus();

      return result;
    } catch (error) {
      console.error('Sync error:', error);

      console.error('Sync Failed:', error instanceof Error ? error.message : 'Failed to sync data');

      // Call error callback if provided
      if (options.onError) {
        options.onError(error);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [session]);

  // Get sync status
  const getSyncStatus = useCallback(async () => {
    if (!(session as any)?.user?.id) {
      return null;
    }

    try {
      const response = await fetch('/api/v1/elysia/sync');

      if (!response.ok) {
        throw new Error('Failed to get sync status');
      }

      const result = await response.json();
      setSyncStatus(result.sync_status);

      return result.sync_status;
    } catch (error) {
      console.error('Failed to get sync status:', error);
      return null;
    }
  }, [session]);

  // Auto-sync on first load if data is stale
  const autoSync = useCallback(async () => {
    const status = await getSyncStatus();

    if (!status) {
      return;
    }

    // Check if data needs syncing
    const needsSync = !status.sync_stats.has_profile ||
                     !status.sync_stats.has_accounts ||
                     !status.sync_stats.has_transactions;

    if (needsSync) {
      console.log('Auto-syncing user data...');
      await syncData({ sync_type: 'all' });
    } else if (status.last_sync) {
      // Check if last sync was more than 24 hours ago
      const lastSync = new Date(status.last_sync);
      const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);

      if (hoursSinceSync > 24) {
        console.log('Data is stale, auto-syncing...');
        await syncData({ sync_type: 'all' });
      }
    }
  }, [getSyncStatus, syncData]);

  // Sync specific data types
  const syncTransactions = useCallback((limit: number = 500) => {
    return syncData({ sync_type: 'transactions', limit });
  }, [syncData]);

  const syncAccounts = useCallback(() => {
    return syncData({ sync_type: 'accounts' });
  }, [syncData]);

  const syncProfile = useCallback(() => {
    return syncData({ sync_type: 'profile' });
  }, [syncData]);

  return {
    // State
    isSyncing,
    syncStatus,
    lastSyncTime,

    // Actions
    syncData,
    syncTransactions,
    syncAccounts,
    syncProfile,
    getSyncStatus,
    autoSync,
  };
}
