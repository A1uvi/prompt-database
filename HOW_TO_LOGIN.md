# How to Login to the AI Prompt Database

## ✅ Email Authentication (Development Mode)

The app now uses **email magic link authentication** that works out of the box without any external setup!

### How It Works

1. **Open the app**: http://localhost:3000
2. **Enter your email** on the login page
3. **Check your terminal/console** where the dev server is running
4. **Click the magic link** shown in the console
5. **You're logged in!**

### Example

When you enter your email (e.g., `test@example.com`), you'll see this in your terminal:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 MAGIC LINK FOR: test@example.com
🔗 Click here to sign in:
http://localhost:3000/api/auth/callback/email?token=...&email=test%40example.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Just **Cmd+Click** (Mac) or **Ctrl+Click** (Windows/Linux) on the URL to sign in!

## 🔐 How It Works

- **Development Mode**: Magic links are logged to console (no email server needed)
- **Production Mode**: Configure email server in `.env` to send real emails
- **Secure**: Uses NextAuth.js email provider with database-backed sessions
- **No Passwords**: Users receive a one-time magic link to sign in

## 📧 Production Email Setup (Optional)

To send real emails in production, add to `.env.local`:

```bash
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### Recommended Email Services

- **Resend** (easiest): https://resend.com
- **SendGrid**: https://sendgrid.com
- **AWS SES**: https://aws.amazon.com/ses/
- **Gmail** (development only)

## 🔑 Google OAuth (Optional)

To enable Google sign-in:

1. Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
2. Add to `.env.local`:
   ```bash
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED="true"
   ```
3. Restart the dev server

## 🎯 Quick Start

**Right now, you can:**

1. Open http://localhost:3000
2. Enter any email address (e.g., `admin@test.com`)
3. Look for the magic link in your terminal
4. Click it to sign in
5. Start creating and managing prompts!

## 🚀 First Login

After signing in, you'll be redirected to `/dashboard` where you can:
- Create your first prompt
- Organize prompts in folders
- Create teams
- Search and discover
- Track activity

No external setup required - just start using the app!

---

**Need help?** The magic link appears in the same terminal where you ran `npm run dev`
