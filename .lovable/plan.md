

## Fix: Store Payment Method on Signup

Right now, the payment method selection is validated in the form but **never saved anywhere**. After signup, the choice is lost. Here's the fix:

### What's Wrong
- The signup form collects `paymentMethod` but the `handleSignup` function never writes it to the database or localStorage.
- When the free subscription is later created (after email confirmation), it defaults to `"online"` or `"free"` instead of the user's actual selection.

### What We'll Do

1. **Save payment method to localStorage alongside the plan** (`src/pages/Auth.tsx`)
   - Add `localStorage.setItem("pending_signup_payment_method", validated.paymentMethod)` right next to where the plan is saved (line 591).

2. **Use the stored payment method when creating the subscription** (`src/pages/ConfirmAccount.tsx`)
   - When the free subscription record is created after email confirmation, read the payment method from localStorage and pass it as the `payment_method` column value.
   - Clean up the localStorage entry after use.

3. **Also store it in the user's profile metadata** (`src/pages/Auth.tsx`)
   - Add `preferred_payment_method` to the Supabase Auth `user_metadata` during signup so it persists with the account.

### Technical Details

**File: `src/pages/Auth.tsx`**
- Line ~591: Add `localStorage.setItem("pending_signup_payment_method", validated.paymentMethod);`
- Line ~524-529: Add `preferred_payment_method: validated.paymentMethod` to the `data` object in `signUp()` options.

**File: `src/pages/ConfirmAccount.tsx`**
- Where the subscription is created after confirmation, read `localStorage.getItem("pending_signup_payment_method")` and use it as the `payment_method` value in the subscription insert.
- Remove the localStorage key after successful use.

### Result
- The payment method will be stored in:
  - **User metadata** (persistent, accessible via `user.user_metadata.preferred_payment_method`)
  - **Subscription record** (in the `payment_method` column)
  - **localStorage** (temporary, for the confirmation flow)
- Admins will see the correct payment method in the Subscription Management panel.

