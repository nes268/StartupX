# Testing Mentor Session Request Feature

This guide will help you test the mentor session request email functionality.

## Prerequisites

1. **MongoDB** must be running
2. **Backend server** must be running
3. **Frontend** must be running
4. At least one **mentor** must exist in the database
5. You must be **logged in** as a user

## Quick Start (Test Without Email Configuration)

If you just want to test the feature without setting up email, the system will log the email content to the console.

### Step 1: Start Backend Server

Open a terminal and run:
```bash
cd server
npm run dev
```

The server should start on `http://localhost:5000`

### Step 2: Start Frontend

Open another terminal and run:
```bash
npm run dev
```

The frontend should start (usually on `http://localhost:5173`)

### Step 3: Verify You Have a Mentor

1. Log in to the application
2. Navigate to the **Mentors** page (Guidance Center)
3. Make sure at least one mentor is displayed
4. If no mentors exist, you can add one through the admin panel

### Step 4: Test the Request Session Form

1. On the Mentors page, click **"Request Session"** on any mentor card
2. Fill out the form:
   - **Startup Name**: Enter your startup name (required)
   - **Topic**: Select a topic from the dropdown (required)
   - **Preferred Time Slot**: Select a time slot (required)
   - **Additional Notes**: Optional - add any notes
3. Click **"Send Request"**

### Step 5: Check the Results

**Without Email Configuration:**
- You should see a success message: "Request Sent Successfully!"
- Check the **backend server console** - you should see:
  ```
  Email would be sent with the following content:
  To: mentor@example.com
  Subject: Mentoring Session Request from [Your Startup Name]
  Body: { startupName, topic, preferredTimeSlot, additionalNotes, ... }
  ```

**With Email Configuration:**
- You should see a success message
- The mentor should receive an email at their registered email address
- Check the mentor's inbox for the formatted email

## Testing With Actual Email (Gmail Setup)

To test with real email sending:

### Step 1: Configure Gmail App Password

1. Go to your Google Account settings
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **Security** → **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### Step 2: Update Server .env File

Edit `server/.env` and add:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/citbif

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=noreply@citbif.com
```

**Important:** Use the App Password, NOT your regular Gmail password!

### Step 3: Restart Backend Server

Stop the server (Ctrl+C) and restart it:
```bash
cd server
npm run dev
```

### Step 4: Test Again

Follow the same testing steps above. This time, the mentor should receive an actual email.

## What to Verify

### ✅ Form Validation
- Try submitting with empty fields - should show error messages
- Required fields should be marked with red asterisks (*)
- Form should prevent submission if required fields are missing

### ✅ Success Flow
- After successful submission, should show success message
- Should auto-redirect back to mentors list after 3 seconds
- Form should reset when going back

### ✅ Error Handling
- If backend is down, should show error message
- If mentor email is invalid, should show error
- Network errors should be handled gracefully

### ✅ Email Content (Check Console or Inbox)
- Mentor's name should be correct
- Startup name should be included
- Topic should be formatted nicely (e.g., "Business Strategy" not "business-strategy")
- Time slot should be formatted nicely
- Requester's email and name should be included (if logged in)
- Additional notes should be included if provided

## Troubleshooting

### Email Not Sending?
1. Check that SMTP credentials are correct in `.env`
2. Verify Gmail App Password is correct (not regular password)
3. Check backend console for error messages
4. Make sure 2FA is enabled on Gmail account

### Form Not Submitting?
1. Check browser console for errors
2. Verify backend server is running
3. Check network tab in browser DevTools
4. Verify you're logged in (user context needed)

### Mentor Not Found Error?
1. Make sure mentor exists in database
2. Verify mentor email is correct
3. Check backend logs for details

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend starts without errors
- [ ] Can navigate to Mentors page
- [ ] Can see mentor cards
- [ ] "Request Session" button works
- [ ] Form displays correctly
- [ ] Form validation works
- [ ] Can submit form successfully
- [ ] Success message displays
- [ ] Email is logged/sent (check console or inbox)
- [ ] Form resets after submission
- [ ] Error handling works (try with backend stopped)

## Next Steps

Once testing is complete:
1. Configure production email settings (use a proper email service like SendGrid, AWS SES, etc.)
2. Add email templates customization if needed
3. Consider adding email notifications to the requester as well
4. Add email delivery tracking/logging to database


