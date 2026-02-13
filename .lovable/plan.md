
## Plan: Admin Social Media Auto-Posting System

This plan will create an admin system that allows you to automatically post AI-generated stories to your connected social media accounts (Facebook, Instagram, X/Twitter, and TikTok) directly from the Stories Management page.

---

### Important Context: API Requirements & Complexity

Each social platform has different requirements for automated posting:

| Platform | API Access | Requirements |
|----------|-----------|--------------|
| **Facebook Page** | Graph API | ✅ Page Access Token (you own the page) |
| **Instagram** | Instagram Graph API | ✅ Connected to Facebook Business Page, Business/Creator account |
| **X (Twitter)** | X API v2 | ✅ Developer account ($100/mo Basic tier for posting) |
| **TikTok** | Content Posting API | ⚠️ Requires TikTok for Developers approval, limited access |

**Recommended Approach**: Start with Facebook + Instagram (they share the same Meta ecosystem and your existing page credentials), then add X/Twitter if you have API access.

---

### Phase 1: Database Setup - Social Media Connections

1. **Create `social_media_connections` table**
   - Store platform credentials securely
   - Fields: platform, access_token (encrypted), page_id, connected_at, expires_at, status
   - RLS: Admin-only access

2. **Create `social_media_posts` table**
   - Track which stories were posted where
   - Fields: story_id, platform, post_id, posted_at, status, error_message
   - Links stories to their social media posts for tracking

---

### Phase 2: Admin Social Media Settings Page

1. **Create `src/pages/admin/SocialMediaSettings.tsx`**
   - OAuth connection flow for each platform
   - Show connected accounts status
   - Test post functionality
   - Disconnect option

2. **Connection Flow for Facebook/Instagram:**
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  Admin Portal → Social Media Settings                       │
   │  ┌─────────────────────────────────────────────────────────┐│
   │  │  Facebook Page                                          ││
   │  │  ┌──────────────────┐  Status: ✅ Connected             ││
   │  │  │ [Connect Page]   │  Page: MetsXMFanZone Official    ││
   │  │  └──────────────────┘  Expires: Never (Long-lived)     ││
   │  │                                                         ││
   │  │  Instagram                                              ││
   │  │  ┌──────────────────┐  Status: ✅ Connected             ││
   │  │  │ [Connect Account]│  Account: @metsxmfanzone         ││
   │  │  └──────────────────┘  Linked to: Facebook Page        ││
   │  │                                                         ││
   │  │  X (Twitter)                                            ││
   │  │  ┌──────────────────┐  Status: ❌ Not Connected        ││
   │  │  │ [Connect]        │  Requires: API Key Setup         ││
   │  │  └──────────────────┘                                   ││
   │  └─────────────────────────────────────────────────────────┘│
   └─────────────────────────────────────────────────────────────┘
   ```

---

### Phase 3: Edge Functions for Social Media Posting

1. **Create `post-to-facebook` Edge Function**
   - Accept: image URL, caption text, page_id, access_token
   - Use Facebook Graph API to post to page
   - Return post ID for tracking

2. **Create `post-to-instagram` Edge Function**
   - Step 1: Create media container with image URL
   - Step 2: Publish the container
   - Requires Instagram Business account linked to Facebook Page

3. **Create `post-to-twitter` Edge Function**
   - Upload media first, get media_id
   - Create tweet with media attachment
   - Requires X API credentials (Bearer token + OAuth 1.0a)

4. **Create `social-media-oauth-callback` Edge Function**
   - Handle OAuth callbacks from Meta/X
   - Exchange code for access token
   - Store tokens securely in database

---

### Phase 4: Update Stories Management with Auto-Post Feature

1. **Add "Post to Social Media" button/section**
   - Appears after story is created/published
   - Shows checkboxes for connected platforms
   - Caption input (pre-filled from story title)
   - Schedule option (post now or schedule)

2. **Updated Story Creation Flow:**
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  Create Story → AI Generated Image Ready                    │
   │  ┌─────────────────────────────────────────────────────────┐│
   │  │  [Image Preview]                                        ││
   │  │                                                         ││
   │  │  Title: "Mets Spring Training Update"                   ││
   │  │                                                         ││
   │  │  ─────────────────────────────────────────────────────  ││
   │  │  📱 Share to Social Media                               ││
   │  │  ☑️ Facebook (MetsXMFanZone Official)                   ││
   │  │  ☑️ Instagram (@metsxmfanzone)                          ││
   │  │  ☐ X/Twitter (@metsxmfanzone)                           ││
   │  │                                                         ││
   │  │  Caption:                                               ││
   │  │  ┌───────────────────────────────────────────────────┐  ││
   │  │  │ 🧡🔵 Spring Training is HERE! Check out our...   │  ││
   │  │  └───────────────────────────────────────────────────┘  ││
   │  │                                                         ││
   │  │  [Save Story Only]  [Save & Post to Social]            ││
   │  └─────────────────────────────────────────────────────────┘│
   └─────────────────────────────────────────────────────────────┘
   ```

---

### Phase 5: Post Tracking & History

1. **Add social media post status to story cards**
   - Icons showing which platforms received the post
   - Click to see post details/links

2. **Create posting history view**
   - List of all social media posts
   - Status (success/failed)
   - Direct links to live posts
   - Retry failed posts

---

### Required Credentials & Setup

**For Facebook/Instagram:**
1. Create a Meta Developer App at developers.facebook.com
2. Add "Facebook Login" product
3. Request `pages_manage_posts` and `instagram_content_publish` permissions
4. Complete Business Verification (required for publishing)
5. Store App ID and App Secret as backend secrets

**For X/Twitter:**
1. Apply for X Developer account (Basic tier: $100/month)
2. Create a project and app
3. Generate API Key, API Secret, Bearer Token
4. Set up OAuth 2.0 with PKCE
5. Store credentials as backend secrets

---

### Required Secrets

| Secret Name | Purpose |
|-------------|---------|
| `META_APP_ID` | Facebook/Instagram App ID |
| `META_APP_SECRET` | Facebook/Instagram App Secret |
| `X_API_KEY` | Twitter/X API Key |
| `X_API_SECRET` | Twitter/X API Secret |
| `X_BEARER_TOKEN` | Twitter/X Bearer Token |

---

### Files to Create

| File | Description |
|------|-------------|
| `src/pages/admin/SocialMediaSettings.tsx` | Admin page for connecting accounts |
| `supabase/functions/post-to-facebook/index.ts` | Facebook posting API |
| `supabase/functions/post-to-instagram/index.ts` | Instagram posting API |
| `supabase/functions/post-to-twitter/index.ts` | X/Twitter posting API |
| `supabase/functions/social-media-oauth-callback/index.ts` | OAuth handler |
| Database migration for `social_media_connections` table | Store credentials |
| Database migration for `social_media_posts` table | Track posts |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/StoriesManagement.tsx` | Add social sharing UI |
| `src/components/AdminSidebar.tsx` | Add Social Media Settings link |

---

### Alternative: Use a Third-Party Service

If dealing with individual platform APIs is too complex, you could use a service like **Ayrshare**, **Buffer**, or **Hootsuite API** that handles all platforms with a single API:

**Ayrshare Example:**
```typescript
// Single API call posts to all platforms
const response = await fetch('https://api.ayrshare.com/api/post', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${AYRSHARE_API_KEY}` },
  body: JSON.stringify({
    post: "🧡🔵 New story on MetsXMFanZone!",
    platforms: ["facebook", "instagram", "twitter"],
    mediaUrls: ["https://your-image-url.com/story.png"]
  })
});
```

This simplifies the implementation significantly but adds a monthly cost (~$15-100/month depending on volume).

---

### Recommended Starting Point

I recommend starting with **Facebook + Instagram only** since:
1. You already have connected pages
2. They share the same Meta API/credentials
3. Most of your audience is likely on these platforms
4. No additional monthly API costs (unlike X/Twitter)

Would you like me to proceed with implementing:
1. **Full implementation** (all platforms with direct API integration)
2. **Meta-only** (Facebook + Instagram using Graph API)
3. **Third-party service** (use Ayrshare/Buffer for simplified multi-platform posting)
