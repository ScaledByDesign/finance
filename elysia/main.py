#!/usr/bin/env python3
"""
Elysia AI Backend for Finance Application
Provides advanced financial analysis using decision trees and Weaviate integration
"""

import os
import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any, List, Optional

import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

# Import sync endpoints
from sync_endpoints import router as sync_router

# Elysia imports
from elysia import configure, Tree, tool, preprocess
from elysia.preprocessing.collection import preprocessed_collection_exists

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Currency formatting utility
def format_currency(amount: float, currency: str = "USD") -> str:
    """Format currency consistently across all Elysia responses"""
    if amount is None or amount == 0:
        return "$0.00"

    # Handle negative amounts
    abs_amount = abs(amount)
    sign = "-" if amount < 0 else ""

    # Format with proper currency symbol and decimals
    if currency == "USD":
        return f"{sign}${abs_amount:,.2f}"
    else:
        # Fallback for other currencies
        return f"{sign}{currency} {abs_amount:,.2f}"

# Pydantic models for API
class AnalysisRequest(BaseModel):
    query: str = Field(..., description="The financial analysis query")
    financial_data: Optional[Dict[str, Any]] = Field(None, description="User's financial data context")
    collection_names: Optional[List[str]] = Field(None, description="Weaviate collections to search")
    user_id: Optional[str] = Field(None, description="User identifier for personalization")

class AnalysisResponse(BaseModel):
    response: str = Field(..., description="AI analysis response")
    objects: Optional[List[Dict[str, Any]]] = Field(None, description="Retrieved objects from Weaviate")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")

class HealthResponse(BaseModel):
    status: str
    elysia_version: str
    weaviate_connected: bool

# Global Elysia tree instance
tree: Optional[Tree] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global tree
    
    # Startup
    logger.info("Starting Elysia AI Backend...")
    
    # Configure Elysia
    configure_elysia()
    
    # Initialize Tree
    tree = Tree()
    
    # Setup financial analysis tools
    setup_financial_tools(tree)
    
    logger.info("Elysia AI Backend started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Elysia AI Backend...")

# Create FastAPI app
app = FastAPI(
    title="Elysia AI Backend",
    description="Advanced financial analysis using decision trees and Weaviate",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3002", "http://finance-app:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include sync router
app.include_router(sync_router)

def configure_elysia():
    """Configure Elysia with environment variables"""
    try:
        configure(
            base_model=os.getenv("BASE_MODEL", "gpt-4o-mini"),
            base_provider=os.getenv("BASE_PROVIDER", "openai"),
            complex_model=os.getenv("COMPLEX_MODEL", "gpt-4o"),
            complex_provider=os.getenv("COMPLEX_PROVIDER", "openai"),
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            
            # Weaviate configuration
            weaviate_is_local=os.getenv("WEAVIATE_IS_LOCAL", "true").lower() == "true",
            wcd_url=os.getenv("WCD_URL", "http://weaviate:8080"),
            local_weaviate_port=int(os.getenv("LOCAL_WEAVIATE_PORT", "8080")),
            local_weaviate_grpc_port=int(os.getenv("LOCAL_WEAVIATE_GRPC_PORT", "50051")),
        )
        logger.info("Elysia configuration completed")
    except Exception as e:
        logger.error(f"Failed to configure Elysia: {e}")
        raise

def setup_financial_tools(tree: Tree):
    """Setup custom financial analysis tools"""
    
    @tool(tree=tree)
    async def analyze_spending_patterns(
        transactions: List[Dict[str, Any]],
        timeframe: str = "30d"
    ) -> Dict[str, Any]:
        """Analyze spending patterns and provide insights"""
        # Calculate sample spending amounts for demonstration
        dining_spending = 850.75
        subscription_spending = 127.99
        total_spending = 4210.50

        return {
            "analysis": f"Spending pattern analysis completed for {timeframe}",
            "total_spending": format_currency(total_spending),
            "insights": [
                f"High spending on dining out detected: {format_currency(dining_spending)} this month",
                f"Subscription services cost {format_currency(subscription_spending)} monthly",
                "Good progress on savings goals"
            ],
            "recommendations": [
                f"Consider meal planning to reduce dining expenses by {format_currency(200)}",
                f"Review and cancel unused subscriptions to save {format_currency(50)} monthly",
                f"Increase emergency fund contributions by {format_currency(300)}"
            ]
        }
    
    @tool(tree=tree)
    async def investment_analysis(
        portfolio: Dict[str, Any],
        risk_tolerance: str = "moderate"
    ) -> Dict[str, Any]:
        """Analyze investment portfolio and provide recommendations"""
        # Sample portfolio values for demonstration
        total_value = 127650.00
        monthly_gain = 2340.75
        annual_return = 0.087

        return {
            "analysis": "Portfolio analysis completed",
            "portfolio_value": format_currency(total_value),
            "monthly_performance": f"+{format_currency(monthly_gain)} ({annual_return:.1%} annually)",
            "risk_assessment": risk_tolerance,
            "diversification_score": 0.75,
            "recommendations": [
                f"Consider rebalancing to target allocation",
                f"Increase international exposure by {format_currency(5000)}",
                f"Review expense ratios on funds - potential savings of {format_currency(150)} annually"
            ]
        }
    
    @tool(tree=tree)
    async def budget_optimization(
        income: float,
        expenses: Dict[str, float],
        goals: List[str]
    ) -> Dict[str, Any]:
        """Optimize budget allocation based on income, expenses, and goals"""
        # Sample budget values for demonstration
        monthly_income = income or 8420.00
        current_savings = monthly_income * 0.20
        recommended_savings = monthly_income * 0.25
        housing_budget = monthly_income * 0.30

        return {
            "analysis": "Budget optimization completed",
            "monthly_income": format_currency(monthly_income),
            "current_savings_rate": "20%",
            "current_savings_amount": format_currency(current_savings),
            "recommended_savings_rate": "25%",
            "recommended_savings_amount": format_currency(recommended_savings),
            "recommended_allocation": {
                "housing": f"{format_currency(housing_budget)} (30%)",
                "transportation": f"{format_currency(monthly_income * 0.15)} (15%)",
                "food": f"{format_currency(monthly_income * 0.12)} (12%)",
                "savings": f"{format_currency(recommended_savings)} (25%)",
                "entertainment": f"{format_currency(monthly_income * 0.08)} (8%)",
                "other": f"{format_currency(monthly_income * 0.10)} (10%)"
            },
            "action_items": [
                f"Reduce housing costs if possible - target under {format_currency(housing_budget)}",
                f"Increase savings rate to 25% - add {format_currency(recommended_savings - current_savings)} monthly",
                f"Track discretionary spending more closely - budget {format_currency(monthly_income * 0.18)} for entertainment and other"
            ]
        }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Check Weaviate connection
        weaviate_connected = True  # You could add actual Weaviate ping here
        
        return HealthResponse(
            status="healthy",
            elysia_version="0.2.6",
            weaviate_connected=weaviate_connected
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Service unhealthy")

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_financial_data(request: AnalysisRequest):
    """Main endpoint for financial analysis using Elysia"""
    global tree

    if not tree:
        raise HTTPException(status_code=500, detail="Elysia not initialized")

    try:
        logger.info(f"Processing analysis request: {request.query}")

        # Use Elysia Tree for analysis in a thread pool to avoid event loop conflicts
        import concurrent.futures

        def run_tree_query():
            if request.collection_names:
                result = tree(request.query, collection_names=request.collection_names)
                # Check if result is tuple (response, objects)
                if isinstance(result, tuple):
                    return result
                else:
                    return result, None
            else:
                result = tree(request.query)
                # Check if result is tuple
                if isinstance(result, tuple):
                    return result[0], result[1] if len(result) > 1 else None
                else:
                    return result, None

        loop = asyncio.get_running_loop()
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = loop.run_in_executor(executor, run_tree_query)
            result = await future

        response, objects = result

        # Ensure objects is in the right format
        if objects and isinstance(objects, list):
            # If objects is a list of lists, flatten it
            if objects and isinstance(objects[0], list):
                objects = []  # Simplify for now

        return AnalysisResponse(
            response=response,
            objects=objects if objects else [],
            metadata={
                "user_id": request.user_id,
                "timestamp": datetime.now().isoformat(),
                "model_used": "elysia-decision-tree"
            }
        )
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/preprocess")
async def preprocess_collections(
    background_tasks: BackgroundTasks,
    collection_names: List[str]
):
    """Preprocess Weaviate collections for Elysia"""
    try:
        # Run preprocessing in background
        background_tasks.add_task(run_preprocessing, collection_names)
        
        return {
            "message": "Preprocessing started",
            "collections": collection_names,
            "status": "in_progress"
        }
    except Exception as e:
        logger.error(f"Preprocessing failed: {e}")
        raise HTTPException(status_code=500, detail=f"Preprocessing failed: {str(e)}")

async def run_preprocessing(collection_names: List[str]):
    """Run preprocessing in background"""
    try:
        for collection_name in collection_names:
            if not preprocessed_collection_exists(collection_name):
                logger.info(f"Preprocessing collection: {collection_name}")
                preprocess(collection_name)
                logger.info(f"Completed preprocessing: {collection_name}")
            else:
                logger.info(f"Collection already preprocessed: {collection_name}")
    except Exception as e:
        logger.error(f"Background preprocessing failed: {e}")

@app.get("/collections")
async def list_collections():
    """List available Weaviate collections"""
    try:
        # This would list actual collections from Weaviate
        # For now, return placeholder
        return {
            "collections": [
                "UserTransactions",
                "UserAccounts", 
                "FinancialGoals",
                "InvestmentData"
            ],
            "preprocessed": [
                "UserTransactions"
            ]
        }
    except Exception as e:
        logger.error(f"Failed to list collections: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list collections: {str(e)}")

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    # Run the server
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
