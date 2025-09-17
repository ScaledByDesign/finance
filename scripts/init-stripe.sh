#!/bin/bash

# Initialize LocalStripe with test data
# This script sets up test products, prices, and customers in LocalStripe

STRIPE_URL="http://localhost:8420"

echo "🚀 Initializing LocalStripe test data..."

# Wait for LocalStripe to be ready
echo "⏳ Waiting for LocalStripe to be ready..."
until curl -s $STRIPE_URL > /dev/null 2>&1; do
  sleep 2
done

echo "✅ LocalStripe is ready!"

# Create test products
echo "📦 Creating test products..."

# Pro Plan Product
PRO_PRODUCT=$(curl -s -X POST $STRIPE_URL/v1/products \
  -d "name=Pro Plan" \
  -d "description=Unlimited access to all features" \
  | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "   Created product: Pro Plan ($PRO_PRODUCT)"

# Create test prices
echo "💰 Creating test prices..."

# Monthly price
MONTHLY_PRICE=$(curl -s -X POST $STRIPE_URL/v1/prices \
  -d "product=$PRO_PRODUCT" \
  -d "unit_amount=999" \
  -d "currency=usd" \
  -d "recurring[interval]=month" \
  | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "   Created price: $9.99/month ($MONTHLY_PRICE)"

# Annual price
ANNUAL_PRICE=$(curl -s -X POST $STRIPE_URL/v1/prices \
  -d "product=$PRO_PRODUCT" \
  -d "unit_amount=9900" \
  -d "currency=usd" \
  -d "recurring[interval]=year" \
  | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "   Created price: $99.00/year ($ANNUAL_PRICE)"

# Create test customers
echo "👥 Creating test customers..."

CUSTOMER1=$(curl -s -X POST $STRIPE_URL/v1/customers \
  -d "email=test@example.com" \
  -d "name=Test User" \
  | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "   Created customer: test@example.com ($CUSTOMER1)"

CUSTOMER2=$(curl -s -X POST $STRIPE_URL/v1/customers \
  -d "email=premium@example.com" \
  -d "name=Premium User" \
  | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "   Created customer: premium@example.com ($CUSTOMER2)"

# Create a test card for the premium customer
echo "💳 Adding test payment methods..."

CARD=$(curl -s -X POST $STRIPE_URL/v1/payment_methods \
  -d "type=card" \
  -d "card[number]=4242424242424242" \
  -d "card[exp_month]=12" \
  -d "card[exp_year]=2025" \
  -d "card[cvc]=123" \
  | grep -o '"id":"[^"]*' | cut -d'"' -f4)

# Attach card to customer
curl -s -X POST $STRIPE_URL/v1/payment_methods/$CARD/attach \
  -d "customer=$CUSTOMER2" > /dev/null

echo "   Added test card ending in 4242"

# Create a test subscription
echo "📅 Creating test subscription..."

SUBSCRIPTION=$(curl -s -X POST $STRIPE_URL/v1/subscriptions \
  -d "customer=$CUSTOMER2" \
  -d "items[0][price]=$MONTHLY_PRICE" \
  -d "default_payment_method=$CARD" \
  | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "   Created subscription for premium@example.com ($SUBSCRIPTION)"

echo ""
echo "✨ LocalStripe initialization complete!"
echo ""
echo "📊 Test Data Summary:"
echo "   - Product: Pro Plan ($PRO_PRODUCT)"
echo "   - Monthly Price: $9.99 ($MONTHLY_PRICE)"
echo "   - Annual Price: $99.00 ($ANNUAL_PRICE)"
echo "   - Test Customers: 2"
echo "   - Active Subscriptions: 1"
echo ""
echo "🌐 Access LocalStripe dashboard at: http://localhost:8420"
echo ""