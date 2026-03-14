# Course Approval System - Implementation Guide

## Overview
Implemented a course approval workflow where all courses submitted from Instructor Studio must be approved by a super admin before being published to the Browse Courses page.

## Super Admin
**Email:** vickkie028@gmail.com

This user has exclusive access to:
- Admin dashboard at `/admin/courses`
- Course approval/rejection functionality
- View all pending courses

## Workflow

### 1. Instructor Submits Course
When an instructor publishes a course from Studio:
- Course is saved with `status: "pending"`
- Course is saved with `approvalStatus: "pending"`
- Instructor receives notification: "Course Submitted for Review"
- Course does NOT appear on Browse Courses page yet

### 2. Admin Reviews Course
Super admin can:
- Access admin dashboard at `/admin/courses`
- View all pending courses
- See course details (title, description, chapters, instructor)
- Approve or reject courses

### 3. Admin Approves Course
When admin approves:
- Course `status` changes to `"published"`
- Course `approvalStatus` changes to `"approved"`
- `publishedAt` timestamp is set
- Course appears on Browse Courses page
- Instructor receives notification: "Course Approved!"

### 4. Admin Rejects Course
When admin rejects:
- Course `status` changes to `"rejected"`
- Course `approvalStatus` changes to `"rejected"`
- Rejection reason is saved
- Course does NOT appear on Browse Courses page
- Instructor receives notification with rejection reason

## Database Schema

### published_courses Collection

**New Fields:**
```javascript
{
  // Existing fields
  title: string,
  description: string,
  chapters: array,
  createdBy: string,
  
  // New approval fields
  status: "pending" | "published" | "rejected",
  approvalStatus: "pending" | "approved" | "rejected",
  submittedAt: string (ISO date),
  publishedAt: string (ISO date) - only set when approved,
  reviewedBy: string (admin email),
  reviewedAt: string (ISO date),
  rejectionReason: string (optional)
}
```

## API Endpoints

### GET /api/admin/courses/pending
Get all pending courses awaiting approval.

**Authorization:** Super admin only (vickkie028@gmail.com)

**Response:**
```json
{
  "courses": [
    {
      "id": "course123",
      "title": "Web Development",
      "description": "Learn web dev",
      "chapters": [...],
      "createdBy": "instructor@example.com",
      "status": "pending",
      "approvalStatus": "pending",
      "submittedAt": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

### POST /api/admin/courses/approve
Approve or reject a course.

**Authorization:** Super admin only

**Request:**
```json
{
  "courseId": "course123",
  "action": "approve" | "reject",
  "rejectionReason": "Optional reason for rejection"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course approved and published"
}
```

### POST /api/studio/publish
Submit course for approval (updated).

**Changes:**
- Now sets `status: "pending"` instead of `"published"`
- Adds `approvalStatus: "pending"`
- Adds `submittedAt` timestamp
- Notification says "submitted for review" instead of "published"

### GET /api/courses/public
Get published courses (updated).

**Changes:**
- Now filters by both:
  - `status == "published"`
  - `approvalStatus == "approved"`
- Only approved courses are returned

## Admin Dashboard

### Access
URL: `/admin/courses`

**Security:**
- Checks if user is logged in
- Checks if user email matches super admin email
- Redirects to home if not authorized
- Shows "Access denied" toast

### Features

**Stats Card:**
- Shows count of pending courses

**Pending Courses List:**
- Shows all courses awaiting approval
- Displays: title, description, instructor, chapter count, submission date
- "Review" button to view details

**Review Dialog:**
- Full course details
- List of all chapters
- "Approve & Publish" button (green)
- "Reject" button (red)

**Reject Dialog:**
- Text area for rejection reason
- Warning message about instructor notification
- Confirmation required

### UI Components
- Cards for course display
- Badges for status (Pending = yellow)
- Icons for visual clarity
- Loading states
- Toast notifications for actions

## Notifications

### Instructor Notifications

**On Submission:**
```
Title: "Course Submitted for Review"
Body: "Your course '[Title]' has been submitted and is awaiting admin approval."
Type: info
Link: /studio
```

**On Approval:**
```
Title: "Course Approved!"
Body: "Your course '[Title]' has been approved and is now published."
Type: achievement
Link: /courses
```

**On Rejection:**
```
Title: "Course Needs Revision"
Body: "Your course '[Title]' was not approved. Reason: [Reason]"
Type: warning
Link: /studio
```

## Security

### Authorization Checks
- Super admin email hardcoded in multiple places
- Server-side validation on all admin endpoints
- Returns 401 if not authenticated
- Returns 403 if not super admin
- Client-side redirect for non-admin users

### Data Validation
- Validates courseId and action parameters
- Checks course exists before approval/rejection
- Validates rejection reason when rejecting

## User Experience

### For Instructors
1. Create course in Studio
2. Click "Publish Course"
3. See success message: "Course submitted for approval"
4. Course appears in "My Published Courses" with "Pending" status
5. Receive notification when approved/rejected
6. If approved: Course visible on Browse Courses
7. If rejected: Can revise and resubmit

### For Super Admin
1. Login with vickkie028@gmail.com
2. Navigate to `/admin/courses`
3. See list of pending courses
4. Click "Review" on any course
5. Review course details and chapters
6. Click "Approve & Publish" or "Reject"
7. If rejecting: Provide reason
8. See confirmation toast
9. Course removed from pending list

### For Students
- Only see approved courses on Browse Courses page
- Cannot see pending or rejected courses
- No indication that approval system exists

## Files Created/Modified

### New Files
1. `src/app/api/admin/courses/pending/route.js` - Get pending courses
2. `src/app/api/admin/courses/approve/route.js` - Approve/reject courses
3. `src/app/admin/courses/page.jsx` - Admin dashboard UI
4. `ADMIN_APPROVAL_SYSTEM.md` - This documentation

### Modified Files
1. `src/app/api/studio/publish/route.js` - Set pending status
2. `src/app/api/courses/public/route.js` - Filter approved only
3. `src/app/studio/page.jsx` - Update success message

## Testing Checklist

### Instructor Flow
- [ ] Create and publish course from Studio
- [ ] Verify course has "pending" status
- [ ] Verify notification received
- [ ] Verify course NOT on Browse Courses page
- [ ] Verify course appears in "My Published Courses"

### Admin Flow
- [ ] Login as vickkie028@gmail.com
- [ ] Access `/admin/courses`
- [ ] See pending courses list
- [ ] Click "Review" on a course
- [ ] View course details
- [ ] Approve a course
- [ ] Verify course appears on Browse Courses
- [ ] Verify instructor receives approval notification
- [ ] Reject a course with reason
- [ ] Verify instructor receives rejection notification

### Security
- [ ] Non-admin cannot access `/admin/courses`
- [ ] Non-admin cannot call admin API endpoints
- [ ] Proper error messages for unauthorized access

### Edge Cases
- [ ] No pending courses (shows empty state)
- [ ] Approve course without chapters
- [ ] Reject without reason (validation error)
- [ ] Multiple admins (if added later)

## Future Enhancements

Possible improvements:
- Multiple admin users with roles
- Bulk approve/reject
- Course revision history
- Admin comments on courses
- Email notifications (in addition to in-app)
- Analytics dashboard for admin
- Approval workflow stages (review → approve)
- Auto-approve trusted instructors
- Course quality scoring
- Plagiarism detection
- Content moderation tools

## Configuration

### Adding More Admins
To add more admin users, update the constant in:
- `src/app/api/admin/courses/pending/route.js`
- `src/app/api/admin/courses/approve/route.js`
- `src/app/admin/courses/page.jsx`

Change from:
```javascript
const SUPER_ADMIN_EMAIL = "vickkie028@gmail.com";
```

To:
```javascript
const SUPER_ADMIN_EMAILS = [
  "vickkie028@gmail.com",
  "another-admin@example.com"
];

// Then check with:
if (!SUPER_ADMIN_EMAILS.includes(session.user.email)) {
  // Not authorized
}
```

## Troubleshooting

### Course not appearing after approval
- Check `approvalStatus` is "approved"
- Check `status` is "published"
- Check `publishedAt` is set
- Clear browser cache

### Admin dashboard not accessible
- Verify logged in as vickkie028@gmail.com
- Check browser console for errors
- Verify API endpoints are working

### Notifications not received
- Check notification creation in API logs
- Verify user email matches `createdBy` field
- Check notifications collection in Firestore

## Support

For issues or questions:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify Firestore data structure
4. Test with different courses
5. Clear cache and retry
