// Centralized demo data service to ensure consistency across all components
import { generateDemoData, isDemoMode } from './demoData'

// Singleton pattern to ensure consistent data across the application
class DemoDataService {
  private static instance: DemoDataService
  private demoData: any = null
  private isInitialized = false

  private constructor() {}

  public static getInstance(): DemoDataService {
    if (!DemoDataService.instance) {
      DemoDataService.instance = new DemoDataService()
    }
    return DemoDataService.instance
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    if (isDemoMode()) {
      this.demoData = generateDemoData()
      console.log('Demo Data Service initialized with:', {
        accountCount: this.demoData.accounts?.length,
        transactionCount: this.demoData.transactions?.length,
        itemCount: this.demoData.items?.length
      })
    }
    
    this.isInitialized = true
  }

  public getDemoData() {
    return this.demoData
  }

  public getAccounts() {
    return this.demoData?.accounts || []
  }

  public getTransactions() {
    return this.demoData?.transactions || []
  }

  public getItems() {
    return this.demoData?.items || []
  }

  public getKPIs() {
    return this.demoData?.kpis || []
  }

  public isDemoMode(): boolean {
    return isDemoMode()
  }

  public getAccountById(accountId: string) {
    return this.demoData?.accounts?.find((acc: any) => acc.account_id === accountId)
  }

  public getTransactionsByAccount(accountId: string) {
    return this.demoData?.transactions?.filter((tx: any) => tx.account_id === accountId) || []
  }

  // Helper method to get account name mapping for filters
  public getAccountIdToNameMapping() {
    const mapping: Record<string, string> = {}
    this.demoData?.accounts?.forEach((account: any) => {
      mapping[account.account_id] = account.name
    })
    return mapping
  }
}

// Export singleton instance
export const demoDataService = DemoDataService.getInstance()

// Helper functions for easy access
export const getDemoAccounts = () => demoDataService.getAccounts()
export const getDemoTransactions = () => demoDataService.getTransactions()
export const getDemoItems = () => demoDataService.getItems()
export const getDemoKPIs = () => demoDataService.getKPIs()
export const isDemoModeActive = () => demoDataService.isDemoMode()
export const getAccountNameMapping = () => demoDataService.getAccountIdToNameMapping()

// Initialize the service (call this in app startup)
export const initializeDemoDataService = async () => {
  await demoDataService.initialize()
}
