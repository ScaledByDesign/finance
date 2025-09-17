#!/usr/bin/env python3
"""
Data Synchronization Service for Elysia
Syncs user accounts and transactions from the main database to Weaviate
"""

import os
import logging
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import hashlib

import weaviate
import weaviate.classes as wvc
from weaviate.classes.config import Property, DataType
import asyncpg
from pydantic import BaseModel, Field

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TransactionData(BaseModel):
    """Transaction data model"""
    transaction_id: str
    user_id: str
    account_id: str
    amount: float
    name: str
    category: List[str]
    date: str
    pending: bool
    merchant_name: Optional[str] = None
    payment_channel: Optional[str] = None
    location: Optional[Dict[str, Any]] = None

class AccountData(BaseModel):
    """Account data model"""
    account_id: str
    user_id: str
    name: str
    type: str
    subtype: Optional[str] = None
    balance_current: float
    balance_available: Optional[float] = None
    balance_limit: Optional[float] = None
    currency: str = "USD"
    institution_name: Optional[str] = None
    last_updated: str

class UserFinancialProfile(BaseModel):
    """User financial profile model"""
    user_id: str
    email: str
    total_assets: float
    total_liabilities: float
    monthly_income: float
    monthly_expenses: float
    savings_rate: float
    risk_tolerance: str = "moderate"
    financial_goals: List[str] = []
    created_at: str
    updated_at: str

class ElysiaDataSync:
    """Handles data synchronization between PostgreSQL and Weaviate"""

    def __init__(self, weaviate_url: str = None, db_url: str = None):
        """Initialize the data sync service"""
        self.weaviate_url = weaviate_url or os.getenv("WCD_URL", "http://weaviate:8080")
        # Use postgres hostname when running inside Docker, localhost otherwise
        default_db_url = "postgresql://financeuser:financepass123@postgres:5432/financedb"
        if not os.path.exists("/.dockerenv"):
            default_db_url = "postgresql://financeuser:financepass123@localhost:5432/financedb"
        self.db_url = db_url or os.getenv("DATABASE_URL", default_db_url)
        self.client = None
        self.db_pool = None

    async def connect(self):
        """Connect to Weaviate and PostgreSQL"""
        try:
            # Connect to Weaviate
            self.client = weaviate.connect_to_local(
                host=self.weaviate_url.replace("http://", "").replace(":8080", ""),
                port=8080,
                grpc_port=50051
            )
            logger.info(f"Connected to Weaviate at {self.weaviate_url}")

            # Connect to PostgreSQL
            self.db_pool = await asyncpg.create_pool(self.db_url, min_size=1, max_size=10)
            logger.info("Connected to PostgreSQL database")

            # Initialize schemas
            await self.initialize_schemas()

        except Exception as e:
            logger.error(f"Failed to connect: {e}")
            raise

    async def disconnect(self):
        """Disconnect from databases"""
        if self.client:
            self.client.close()
        if self.db_pool:
            await self.db_pool.close()

    async def initialize_schemas(self):
        """Create Weaviate schemas for financial data"""
        try:
            # Check if collections exist
            existing_collections = self.client.collections.list_all()
            existing_names = [col.name for col in existing_collections]

            # Create Transaction collection
            if "Transaction" not in existing_names:
                self.client.collections.create(
                    name="Transaction",
                    properties=[
                        Property(name="transaction_id", data_type=DataType.TEXT),
                        Property(name="user_id", data_type=DataType.TEXT),
                        Property(name="account_id", data_type=DataType.TEXT),
                        Property(name="amount", data_type=DataType.NUMBER),
                        Property(name="name", data_type=DataType.TEXT),
                        Property(name="category", data_type=DataType.TEXT_ARRAY),
                        Property(name="date", data_type=DataType.TEXT),
                        Property(name="pending", data_type=DataType.BOOL),
                        Property(name="merchant_name", data_type=DataType.TEXT),
                        Property(name="payment_channel", data_type=DataType.TEXT),
                        Property(name="month_year", data_type=DataType.TEXT),
                        Property(name="description_embedding", data_type=DataType.TEXT),
                    ],
                    vectorizer_config=wvc.config.Configure.Vectorizer.none(),
                )
                logger.info("Created Transaction collection")

            # Create Account collection
            if "Account" not in existing_names:
                self.client.collections.create(
                    name="Account",
                    properties=[
                        Property(name="account_id", data_type=DataType.TEXT),
                        Property(name="user_id", data_type=DataType.TEXT),
                        Property(name="name", data_type=DataType.TEXT),
                        Property(name="type", data_type=DataType.TEXT),
                        Property(name="subtype", data_type=DataType.TEXT),
                        Property(name="balance_current", data_type=DataType.NUMBER),
                        Property(name="balance_available", data_type=DataType.NUMBER),
                        Property(name="balance_limit", data_type=DataType.NUMBER),
                        Property(name="currency", data_type=DataType.TEXT),
                        Property(name="institution_name", data_type=DataType.TEXT),
                        Property(name="last_updated", data_type=DataType.TEXT),
                    ],
                    vectorizer_config=wvc.config.Configure.Vectorizer.none(),
                )
                logger.info("Created Account collection")

            # Create UserProfile collection
            if "UserProfile" not in existing_names:
                self.client.collections.create(
                    name="UserProfile",
                    properties=[
                        Property(name="user_id", data_type=DataType.TEXT),
                        Property(name="email", data_type=DataType.TEXT),
                        Property(name="total_assets", data_type=DataType.NUMBER),
                        Property(name="total_liabilities", data_type=DataType.NUMBER),
                        Property(name="monthly_income", data_type=DataType.NUMBER),
                        Property(name="monthly_expenses", data_type=DataType.NUMBER),
                        Property(name="savings_rate", data_type=DataType.NUMBER),
                        Property(name="risk_tolerance", data_type=DataType.TEXT),
                        Property(name="financial_goals", data_type=DataType.TEXT_ARRAY),
                        Property(name="created_at", data_type=DataType.TEXT),
                        Property(name="updated_at", data_type=DataType.TEXT),
                    ],
                    vectorizer_config=wvc.config.Configure.Vectorizer.none(),
                )
                logger.info("Created UserProfile collection")

            logger.info("Schema initialization complete")

        except Exception as e:
            logger.error(f"Failed to initialize schemas: {e}")
            raise

    async def sync_user_transactions(self, user_id: str, limit: int = 500) -> Dict[str, Any]:
        """Sync user transactions from PostgreSQL to Weaviate"""
        try:
            async with self.db_pool.acquire() as conn:
                # Fetch transactions from PostgreSQL
                query = """
                    SELECT
                        t.id, t.user_id, t.account_id, t.amount, t.name,
                        t.category, t.date, t.pending, t.merchant_name,
                        t.payment_channel, t.location_lat, t.location_lon,
                        t.location_address, t.location_city, t.location_region,
                        t.created_at, t.updated_at
                    FROM "Transaction" t
                    WHERE t.user_id = $1
                    ORDER BY t.date DESC
                    LIMIT $2
                """
                rows = await conn.fetch(query, user_id, limit)

                if not rows:
                    logger.info(f"No transactions found for user {user_id}")
                    return {"synced": 0, "status": "no_data"}

                # Prepare transactions for Weaviate
                transaction_collection = self.client.collections.get("Transaction")
                transactions_to_sync = []

                for row in rows:
                    # Create transaction object
                    transaction_data = {
                        "transaction_id": row["id"],
                        "user_id": row["user_id"],
                        "account_id": row["account_id"] or "",
                        "amount": float(row["amount"]),
                        "name": row["name"],
                        "category": json.loads(row["category"]) if row["category"] else [],
                        "date": row["date"].isoformat() if row["date"] else "",
                        "pending": row["pending"],
                        "merchant_name": row["merchant_name"] or "",
                        "payment_channel": row["payment_channel"] or "",
                        "month_year": row["date"].strftime("%Y-%m") if row["date"] else "",
                        "description_embedding": f"{row['name']} {row['merchant_name'] or ''} {' '.join(json.loads(row['category']) if row['category'] else [])}",
                    }

                    # Generate UUID for Weaviate
                    uuid = self._generate_uuid(f"transaction_{row['id']}")
                    transactions_to_sync.append((uuid, transaction_data))

                # Batch import to Weaviate
                with transaction_collection.batch.dynamic() as batch:
                    for uuid, data in transactions_to_sync:
                        batch.add_object(
                            properties=data,
                            uuid=uuid
                        )

                logger.info(f"Synced {len(transactions_to_sync)} transactions for user {user_id}")

                return {
                    "synced": len(transactions_to_sync),
                    "status": "success",
                    "last_sync": datetime.now().isoformat()
                }

        except Exception as e:
            logger.error(f"Failed to sync transactions: {e}")
            return {"synced": 0, "status": "error", "error": str(e)}

    async def sync_user_accounts(self, user_id: str) -> Dict[str, Any]:
        """Sync user accounts from PostgreSQL to Weaviate"""
        try:
            async with self.db_pool.acquire() as conn:
                # Fetch accounts from PostgreSQL
                query = """
                    SELECT
                        a.id, a.user_id, a.item_id, a.name, a.type, a.subtype,
                        a.balance_current, a.balance_available, a.balance_limit,
                        a.iso_currency_code, a.created_at, a.updated_at,
                        i.institution_name
                    FROM "Account" a
                    LEFT JOIN "Item" i ON a.item_id = i.id
                    WHERE a.user_id = $1
                """
                rows = await conn.fetch(query, user_id)

                if not rows:
                    logger.info(f"No accounts found for user {user_id}")
                    return {"synced": 0, "status": "no_data"}

                # Prepare accounts for Weaviate
                account_collection = self.client.collections.get("Account")
                accounts_to_sync = []

                for row in rows:
                    account_data = {
                        "account_id": row["id"],
                        "user_id": row["user_id"],
                        "name": row["name"],
                        "type": row["type"] or "unknown",
                        "subtype": row["subtype"] or "",
                        "balance_current": float(row["balance_current"] or 0),
                        "balance_available": float(row["balance_available"] or 0),
                        "balance_limit": float(row["balance_limit"] or 0),
                        "currency": row["iso_currency_code"] or "USD",
                        "institution_name": row["institution_name"] or "",
                        "last_updated": row["updated_at"].isoformat() if row["updated_at"] else datetime.now().isoformat(),
                    }

                    uuid = self._generate_uuid(f"account_{row['id']}")
                    accounts_to_sync.append((uuid, account_data))

                # Batch import to Weaviate
                with account_collection.batch.dynamic() as batch:
                    for uuid, data in accounts_to_sync:
                        batch.add_object(
                            properties=data,
                            uuid=uuid
                        )

                logger.info(f"Synced {len(accounts_to_sync)} accounts for user {user_id}")

                return {
                    "synced": len(accounts_to_sync),
                    "status": "success",
                    "last_sync": datetime.now().isoformat()
                }

        except Exception as e:
            logger.error(f"Failed to sync accounts: {e}")
            return {"synced": 0, "status": "error", "error": str(e)}

    async def sync_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Create/update user financial profile in Weaviate"""
        try:
            async with self.db_pool.acquire() as conn:
                # Fetch user data
                user_query = """
                    SELECT id, email, created_at, updated_at
                    FROM "User"
                    WHERE id = $1
                """
                user = await conn.fetchrow(user_query, user_id)

                if not user:
                    return {"status": "user_not_found"}

                # Calculate financial metrics
                metrics_query = """
                    WITH account_totals AS (
                        SELECT
                            SUM(CASE WHEN type IN ('depository', 'investment') THEN balance_current ELSE 0 END) as total_assets,
                            SUM(CASE WHEN type IN ('credit', 'loan') THEN balance_current ELSE 0 END) as total_liabilities
                        FROM "Account"
                        WHERE user_id = $1
                    ),
                    transaction_stats AS (
                        SELECT
                            AVG(CASE WHEN amount > 0 THEN amount ELSE 0 END) as avg_income,
                            AVG(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as avg_expense,
                            COUNT(DISTINCT DATE_TRUNC('month', date)) as months_of_data
                        FROM "Transaction"
                        WHERE user_id = $1
                        AND date >= CURRENT_DATE - INTERVAL '6 months'
                    )
                    SELECT
                        COALESCE(at.total_assets, 0) as total_assets,
                        COALESCE(at.total_liabilities, 0) as total_liabilities,
                        COALESCE(ts.avg_income * 30, 0) as monthly_income,
                        COALESCE(ts.avg_expense * 30, 0) as monthly_expenses,
                        CASE
                            WHEN ts.avg_income > 0 THEN
                                ((ts.avg_income - ts.avg_expense) / ts.avg_income)
                            ELSE 0
                        END as savings_rate
                    FROM account_totals at, transaction_stats ts
                """
                metrics = await conn.fetchrow(metrics_query, user_id)

                # Create user profile
                profile_data = {
                    "user_id": user_id,
                    "email": user["email"],
                    "total_assets": float(metrics["total_assets"]),
                    "total_liabilities": float(metrics["total_liabilities"]),
                    "monthly_income": float(metrics["monthly_income"]),
                    "monthly_expenses": float(metrics["monthly_expenses"]),
                    "savings_rate": float(metrics["savings_rate"]),
                    "risk_tolerance": "moderate",  # Default, can be updated based on user preferences
                    "financial_goals": [],  # Can be populated from user settings
                    "created_at": user["created_at"].isoformat(),
                    "updated_at": datetime.now().isoformat(),
                }

                # Save to Weaviate
                profile_collection = self.client.collections.get("UserProfile")
                uuid = self._generate_uuid(f"profile_{user_id}")

                profile_collection.data.insert(
                    properties=profile_data,
                    uuid=uuid
                )

                logger.info(f"Synced profile for user {user_id}")

                return {
                    "status": "success",
                    "profile": profile_data,
                    "last_sync": datetime.now().isoformat()
                }

        except Exception as e:
            logger.error(f"Failed to sync user profile: {e}")
            return {"status": "error", "error": str(e)}

    async def sync_all_user_data(self, user_id: str) -> Dict[str, Any]:
        """Sync all user data (profile, accounts, transactions)"""
        results = {
            "user_id": user_id,
            "sync_time": datetime.now().isoformat(),
            "results": {}
        }

        # Sync profile
        profile_result = await self.sync_user_profile(user_id)
        results["results"]["profile"] = profile_result

        # Sync accounts
        accounts_result = await self.sync_user_accounts(user_id)
        results["results"]["accounts"] = accounts_result

        # Sync transactions
        transactions_result = await self.sync_user_transactions(user_id)
        results["results"]["transactions"] = transactions_result

        # Overall status
        all_success = all(
            r.get("status") in ["success", "no_data"]
            for r in results["results"].values()
        )
        results["overall_status"] = "success" if all_success else "partial"

        return results

    def _generate_uuid(self, seed: str) -> str:
        """Generate deterministic UUID from seed string"""
        hash_object = hashlib.md5(seed.encode())
        hex_dig = hash_object.hexdigest()
        # Format as UUID v4
        return f"{hex_dig[:8]}-{hex_dig[8:12]}-4{hex_dig[13:16]}-{hex_dig[16:20]}-{hex_dig[20:32]}"

    async def search_transactions(self, user_id: str, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search user transactions using Weaviate"""
        try:
            transaction_collection = self.client.collections.get("Transaction")

            # Search with filters
            results = transaction_collection.query.fetch_objects(
                where=(
                    wvc.query.Filter.by_property("user_id").equal(user_id)
                ),
                limit=limit
            )

            transactions = []
            for obj in results.objects:
                transactions.append(obj.properties)

            return transactions

        except Exception as e:
            logger.error(f"Failed to search transactions: {e}")
            return []

# CLI for testing
if __name__ == "__main__":
    import asyncio
    import sys

    async def main():
        if len(sys.argv) < 2:
            print("Usage: python data_sync.py <command> [user_id]")
            print("Commands: init, sync-all, sync-transactions, sync-accounts, sync-profile")
            return

        command = sys.argv[1]
        user_id = sys.argv[2] if len(sys.argv) > 2 else None

        sync = ElysiaDataSync()
        await sync.connect()

        try:
            if command == "init":
                print("Initializing schemas...")
                await sync.initialize_schemas()
                print("Schemas initialized successfully")

            elif command == "sync-all" and user_id:
                print(f"Syncing all data for user {user_id}...")
                result = await sync.sync_all_user_data(user_id)
                print(json.dumps(result, indent=2))

            elif command == "sync-transactions" and user_id:
                print(f"Syncing transactions for user {user_id}...")
                result = await sync.sync_user_transactions(user_id)
                print(json.dumps(result, indent=2))

            elif command == "sync-accounts" and user_id:
                print(f"Syncing accounts for user {user_id}...")
                result = await sync.sync_user_accounts(user_id)
                print(json.dumps(result, indent=2))

            elif command == "sync-profile" and user_id:
                print(f"Syncing profile for user {user_id}...")
                result = await sync.sync_user_profile(user_id)
                print(json.dumps(result, indent=2))

            else:
                print("Invalid command or missing user_id")

        finally:
            await sync.disconnect()

    asyncio.run(main())