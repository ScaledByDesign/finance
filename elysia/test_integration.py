#!/usr/bin/env python3
"""
Test script for Elysia integration
Run this to verify that Elysia is working correctly
"""

import asyncio
import json
from elysia import Tree, tool, configure

async def test_elysia_basic():
    """Test basic Elysia functionality"""
    print("🧪 Testing basic Elysia functionality...")
    
    # Configure Elysia (using environment variables)
    try:
        configure()
        print("✅ Elysia configuration successful")
    except Exception as e:
        print(f"❌ Elysia configuration failed: {e}")
        return False
    
    # Create a tree
    tree = Tree()
    
    # Add a simple test tool
    @tool(tree=tree)
    async def test_calculation(x: int, y: int) -> int:
        """Simple test calculation"""
        return x + y
    
    # Test the tool
    try:
        result = tree("What is 5 plus 3?")
        print(f"✅ Basic tool test successful: {result}")
        return True
    except Exception as e:
        print(f"❌ Basic tool test failed: {e}")
        return False

async def test_financial_tools():
    """Test financial analysis tools"""
    print("\n💰 Testing financial analysis tools...")
    
    tree = Tree()
    
    @tool(tree=tree)
    async def analyze_spending(amount: float, category: str) -> dict:
        """Analyze spending in a category"""
        return {
            "amount": amount,
            "category": category,
            "analysis": f"You spent ${amount} on {category}",
            "recommendation": "Consider tracking this expense category"
        }
    
    try:
        result = tree("I spent $150 on groceries, can you analyze this?")
        print(f"✅ Financial tool test successful")
        print(f"   Result type: {type(result)}")
        return True
    except Exception as e:
        print(f"❌ Financial tool test failed: {e}")
        return False

async def test_weaviate_connection():
    """Test Weaviate connection"""
    print("\n🔍 Testing Weaviate connection...")
    
    try:
        from elysia.util.client import ClientManager
        
        with ClientManager().connect_to_client() as client:
            # Try to get schema
            schema = client.schema.get()
            print(f"✅ Weaviate connection successful")
            print(f"   Schema classes: {len(schema.get('classes', []))}")
            return True
    except Exception as e:
        print(f"❌ Weaviate connection failed: {e}")
        print("   This is expected if Weaviate is not running")
        return False

async def main():
    """Run all tests"""
    print("🚀 Elysia Integration Test Suite")
    print("=" * 40)
    
    tests = [
        ("Basic Functionality", test_elysia_basic),
        ("Financial Tools", test_financial_tools),
        ("Weaviate Connection", test_weaviate_connection),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n📊 Test Results Summary")
    print("=" * 40)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Elysia is ready to use.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
    
    return passed == total

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
