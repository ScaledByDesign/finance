'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, Check, AlertCircle, Cloud, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useElysiaSync } from '@/hooks/useElysiaSync';
import { formatDistanceToNow } from 'date-fns';

export function ElysiaSyncStatus() {
  const {
    isSyncing,
    syncStatus,
    lastSyncTime,
    syncData,
    getSyncStatus,
    autoSync,
  } = useElysiaSync();

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initial load - check status and auto-sync if needed
    const initialize = async () => {
      await getSyncStatus();
      await autoSync();
      setIsInitializing(false);
    };

    initialize();
  }, [getSyncStatus, autoSync]);

  const handleManualSync = async () => {
    await syncData({ sync_type: 'all' });
  };

  const handlePartialSync = async (type: 'transactions' | 'accounts' | 'profile') => {
    await syncData({ sync_type: type });
  };

  if (isInitializing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            AI Data Sync
          </CardTitle>
          <CardDescription>Initializing sync status...</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={33} className="w-full" />
        </CardContent>
      </Card>
    );
  }

  const getSyncStatusBadge = () => {
    if (!syncStatus) {
      return <Badge variant="outline">Not Synced</Badge>;
    }

    const { has_transactions, has_accounts, has_profile } = syncStatus.sync_stats;

    if (has_transactions && has_accounts && has_profile) {
      return <Badge variant="default" className="bg-green-600">Fully Synced</Badge>;
    } else if (has_transactions || has_accounts || has_profile) {
      return <Badge variant="secondary">Partially Synced</Badge>;
    } else {
      return <Badge variant="outline">Not Synced</Badge>;
    }
  };

  const getLastSyncText = () => {
    if (lastSyncTime) {
      return `Last synced ${formatDistanceToNow(lastSyncTime, { addSuffix: true })}`;
    } else if (syncStatus?.last_sync) {
      return `Last synced ${formatDistanceToNow(new Date(syncStatus.last_sync), { addSuffix: true })}`;
    }
    return 'Never synced';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              AI Data Sync
            </CardTitle>
            {getSyncStatusBadge()}
          </div>
          <Button
            onClick={handleManualSync}
            disabled={isSyncing}
            size="sm"
            variant="outline"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
        </div>
        <CardDescription>{getLastSyncText()}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sync Progress */}
        {isSyncing && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Syncing your financial data...</p>
            <Progress value={66} className="w-full" />
          </div>
        )}

        {/* Sync Status Details */}
        {syncStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Profile Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Profile</span>
              </div>
              {syncStatus.sync_stats.has_profile ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Button
                  onClick={() => handlePartialSync('profile')}
                  disabled={isSyncing}
                  size="sm"
                  variant="ghost"
                >
                  Sync
                </Button>
              )}
            </div>

            {/* Accounts Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Accounts</span>
              </div>
              {syncStatus.sync_stats.has_accounts ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Button
                  onClick={() => handlePartialSync('accounts')}
                  disabled={isSyncing}
                  size="sm"
                  variant="ghost"
                >
                  Sync
                </Button>
              )}
            </div>

            {/* Transactions Status */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Transactions</span>
              </div>
              {syncStatus.sync_stats.has_transactions ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Button
                  onClick={() => handlePartialSync('transactions')}
                  disabled={isSyncing}
                  size="sm"
                  variant="ghost"
                >
                  Sync
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Info Message */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Syncing your data enables AI-powered insights and analysis
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Your financial data is securely processed locally and never leaves your infrastructure
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}