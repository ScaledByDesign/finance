# Next.js 15 Migration Plan

## Current State
- **Current Version**: Next.js 14.2.3
- **React Version**: 18
- **Router Type**: App Router
- **TypeScript**: Yes

## Migration Overview

### 1. Major Breaking Changes to Address

#### Async Request APIs (CRITICAL)
The following APIs now require `await`:
- `cookies()`
- `headers()`
- `searchParams` (in page components)
- `params` (in page components)

**Files Affected**:
- `/src/app/actions/stripe.js` - Uses `headers()`
- `/src/app/dashboard/checkout/success/page.tsx` - Uses `searchParams`
- `/src/app/v2/chat/[id]/page.tsx` - Uses `params`

#### Caching Changes
- `fetch()` requests no longer cached by default
- GET Route Handlers no longer cached by default
- Client navigation no longer cached by default

**Impact**: May improve freshness but could affect performance. Need to review and explicitly add caching where needed.

#### NextAuth.js Compatibility
- Current version: 4.23.1
- May need update to NextAuth.js v5 (Auth.js) for full Next.js 15 compatibility

### 2. Step-by-Step Migration Process

#### Phase 1: Preparation (Low Risk)
```bash
# 1. Create a new branch
git checkout -b upgrade/nextjs-15

# 2. Ensure all tests pass
npm test

# 3. Build successfully
npm run build

# 4. Backup current lock file
cp package-lock.json package-lock.json.backup
```

#### Phase 2: Automated Migration (Medium Risk)
```bash
# 1. Run the Next.js codemod to update async APIs
npx @next/codemod@canary upgrade latest

# This will:
# - Update package.json dependencies
# - Apply async API codemods
# - Show available codemods for selection
```

#### Phase 3: Manual Updates (High Risk)

##### Update async APIs in Server Actions
```javascript
// Before (stripe.js)
success_url: `${headers().get("origin")}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`

// After
const headersList = await headers()
success_url: `${headersList.get("origin")}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`
```

##### Update page components with searchParams
```typescript
// Before (success/page.tsx)
export default async function CheckoutSuccessPage({
    searchParams
}: {
    searchParams: { session_id: string }
}) {
    // ...
}

// After
export default async function CheckoutSuccessPage({
    searchParams
}: {
    searchParams: Promise<{ session_id: string }>
}) {
    const params = await searchParams;
    // Use params.session_id
}
```

##### Update dynamic route params
```typescript
// Before (v2/chat/[id]/page.tsx)
export default function ChatPage({ params }: { params: { id: string } }) {
    const chatId = params.id;
}

// After
export default async function ChatPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id: chatId } = await params;
}
```

#### Phase 4: Dependency Updates
```bash
# Update core dependencies
npm install next@15 react@19 react-dom@19

# Update dev dependencies
npm install --save-dev eslint-config-next@15 @types/react@^19 @types/react-dom@^19

# Update NextAuth if needed
npm install next-auth@beta  # For v5 compatibility

# Update AI SDK if available
npm install ai@latest @ai-sdk/openai@latest
```

#### Phase 5: Caching Strategy

Add explicit caching where needed:
```javascript
// For fetch requests that should be cached
fetch(url, {
    cache: 'force-cache',
    next: { revalidate: 3600 } // 1 hour
})

// For Route Handlers that should be cached
export const dynamic = 'force-static'
export const revalidate = 3600
```

### 3. Testing Checklist

- [ ] All pages load without errors
- [ ] Authentication flow works (Google OAuth)
- [ ] Plaid integration connects and syncs
- [ ] AI chat functions properly
- [ ] Stripe checkout and subscriptions work
- [ ] Database operations (Prisma) function
- [ ] Redis caching works
- [ ] Server Actions execute correctly
- [ ] Client-side navigation performs well
- [ ] Build completes successfully
- [ ] No TypeScript errors

### 4. Rollback Plan

If issues arise:
```bash
# 1. Restore package files
git checkout -- package.json
mv package-lock.json.backup package-lock.json

# 2. Reinstall dependencies
rm -rf node_modules
npm install

# 3. Verify working state
npm run dev
```

### 5. Performance Optimizations

After migration, consider:
- Enabling Turbopack for development: `next dev --turbo`
- Implementing Partial Prerendering for mixed static/dynamic content
- Using Server Components more extensively
- Implementing the new `after()` API for post-response processing

### 6. Potential Issues & Solutions

**Issue**: Client components using `searchParams` directly
**Solution**: Use `useSearchParams()` hook in client components

**Issue**: Middleware using removed `geo` and `ip` properties
**Solution**: Get these from hosting provider headers

**Issue**: ESLint configuration conflicts
**Solution**: Next.js 15 auto-applies `ESLINT_USE_FLAT_CONFIG=false` for compatibility

**Issue**: TypeScript errors with async page props
**Solution**: Update type definitions to use `Promise<>` wrapper

### 7. Benefits After Migration

- **React 19 Support**: Access to latest React features
- **Turbopack Stable**: Faster development builds
- **Better Security**: Server Actions with unguessable endpoints
- **Performance**: Improved static indicator and self-hosting options
- **Developer Experience**: TypeScript support for next.config.ts
- **Future-Proof**: Prepared for upcoming React and Next.js features

## Estimated Timeline

- **Phase 1-2**: 1 hour (automated)
- **Phase 3-4**: 2-4 hours (manual updates)
- **Phase 5**: 2-3 hours (testing)
- **Total**: 5-8 hours

## Risk Assessment

- **Low Risk**: Automated codemods, dependency updates
- **Medium Risk**: Async API changes, caching modifications
- **High Risk**: Authentication changes, third-party library compatibility

## Recommendation

1. **Start with a fresh branch** and thorough testing
2. **Run automated codemods first** to handle most changes
3. **Focus on async API updates** as the primary breaking change
4. **Test thoroughly** especially authentication and payment flows
5. **Consider staging deployment** before production

The migration is worthwhile for:
- Long-term maintenance and support
- Access to React 19 features
- Improved performance with Turbopack
- Better security with Server Actions

However, wait if:
- You need 100% stability for production
- Third-party dependencies aren't ready
- You don't have time for thorough testing