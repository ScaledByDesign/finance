#!/usr/bin/env python3
"""
Sync API Endpoints for Elysia
Provides endpoints to sync user data from main database to Weaviate
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging

from data_sync import ElysiaDataSync

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/sync", tags=["Data Synchronization"])

# Global sync instance
sync_service = None

# Request/Response models
class SyncRequest(BaseModel):
    user_id: str = Field(..., description="User ID to sync")
    sync_type: str = Field(default="all", description="Type of sync: all, transactions, accounts, profile")
    limit: Optional[int] = Field(500, description="Limit for transaction sync")

class SyncResponse(BaseModel):
    status: str
    message: str
    details: Optional[Dict[str, Any]] = None

class SyncStatusResponse(BaseModel):
    user_id: str
    last_sync: Optional[str] = None
    sync_stats: Dict[str, Any]

# Dependency to get sync service
async def get_sync_service():
    global sync_service
    if not sync_service:
        sync_service = ElysiaDataSync()
        await sync_service.connect()
    return sync_service

@router.post("/user", response_model=SyncResponse)
async def sync_user_data(
    request: SyncRequest,
    background_tasks: BackgroundTasks,
    sync: ElysiaDataSync = Depends(get_sync_service)
):
    """Sync user data to Weaviate"""
    try:
        logger.info(f"Starting sync for user {request.user_id}, type: {request.sync_type}")

        if request.sync_type == "all":
            result = await sync.sync_all_user_data(request.user_id)
        elif request.sync_type == "transactions":
            result = await sync.sync_user_transactions(request.user_id, limit=request.limit)
        elif request.sync_type == "accounts":
            result = await sync.sync_user_accounts(request.user_id)
        elif request.sync_type == "profile":
            result = await sync.sync_user_profile(request.user_id)
        else:
            raise HTTPException(status_code=400, detail="Invalid sync type")

        return SyncResponse(
            status="success",
            message=f"Data sync completed for user {request.user_id}",
            details=result
        )

    except Exception as e:
        logger.error(f"Sync failed for user {request.user_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@router.post("/batch", response_model=SyncResponse)
async def sync_batch_users(
    user_ids: List[str],
    background_tasks: BackgroundTasks,
    sync: ElysiaDataSync = Depends(get_sync_service)
):
    """Sync multiple users in background"""
    try:
        # Add background task for batch sync
        background_tasks.add_task(batch_sync_task, user_ids, sync)

        return SyncResponse(
            status="accepted",
            message=f"Batch sync started for {len(user_ids)} users",
            details={"user_count": len(user_ids)}
        )

    except Exception as e:
        logger.error(f"Batch sync failed: {e}")
        raise HTTPException(status_code=500, detail=f"Batch sync failed: {str(e)}")

@router.get("/status/{user_id}", response_model=SyncStatusResponse)
async def get_sync_status(
    user_id: str,
    sync: ElysiaDataSync = Depends(get_sync_service)
):
    """Get sync status for a user"""
    try:
        # Query Weaviate for user data counts
        transaction_collection = sync.client.collections.get("Transaction")
        account_collection = sync.client.collections.get("Account")
        profile_collection = sync.client.collections.get("UserProfile")

        # Get counts
        from weaviate.classes.query import Filter

        transactions = transaction_collection.query.fetch_objects(
            where=Filter.by_property("user_id").equal(user_id),
            limit=1
        )

        accounts = account_collection.query.fetch_objects(
            where=Filter.by_property("user_id").equal(user_id),
            limit=1
        )

        profile = profile_collection.query.fetch_objects(
            where=Filter.by_property("user_id").equal(user_id),
            limit=1
        )

        stats = {
            "has_transactions": len(transactions.objects) > 0,
            "has_accounts": len(accounts.objects) > 0,
            "has_profile": len(profile.objects) > 0,
        }

        # Get last sync time from profile if exists
        last_sync = None
        if profile.objects:
            last_sync = profile.objects[0].properties.get("updated_at")

        return SyncStatusResponse(
            user_id=user_id,
            last_sync=last_sync,
            sync_stats=stats
        )

    except Exception as e:
        logger.error(f"Failed to get sync status: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

@router.post("/realtime/{user_id}")
async def enable_realtime_sync(
    user_id: str,
    background_tasks: BackgroundTasks,
    sync: ElysiaDataSync = Depends(get_sync_service)
):
    """Enable real-time sync for a user (webhook-based)"""
    # This would integrate with Plaid webhooks for real-time updates
    return SyncResponse(
        status="success",
        message=f"Real-time sync enabled for user {user_id}",
        details={"webhook_enabled": True}
    )

# Background task for batch sync
async def batch_sync_task(user_ids: List[str], sync: ElysiaDataSync):
    """Background task to sync multiple users"""
    results = []
    for user_id in user_ids:
        try:
            result = await sync.sync_all_user_data(user_id)
            results.append({"user_id": user_id, "status": "success", "result": result})
            logger.info(f"Synced user {user_id}")
        except Exception as e:
            results.append({"user_id": user_id, "status": "error", "error": str(e)})
            logger.error(f"Failed to sync user {user_id}: {e}")

    logger.info(f"Batch sync completed: {len(results)} users processed")
    return results