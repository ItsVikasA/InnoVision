# Certificate Update - Total Course Hours

## Changes Made

Added **Total Course Hours** to certificates to show the duration of completed courses.

## What's New

### Certificate Display
The certificate now shows:
1. User Name
2. Course Title
3. Completion Date
4. Total Chapters
5. **Course Duration** (NEW) - e.g., "Course Duration: 5.5 hours"
6. Certificate ID
7. Verification URL

### Visual Layout
```
┌─────────────────────────────────────────┐
│         CERTIFICATE OF COMPLETION        │
│                                          │
│      This is to certify that            │
│           [User Name]                    │
│   has successfully completed the course  │
│          [Course Title]                  │
│                                          │
│   Completed on: January 15, 2026         │
│   Total Chapters: 12                     │
│   Course Duration: 5.5 hours  ← NEW      │
│   Certificate ID: a1B2c3D4e5F6           │
└─────────────────────────────────────────┘
```

## How Hours are Calculated

The system calculates total hours from chapter data:

### Method 1: From Chapter Duration
If chapters have a `duration` field:
- **Number format**: Assumes minutes, converts to hours
  - Example: `duration: 30` → 0.5 hours
- **String format**: Parses "X hours" or "X mins"
  - Example: `duration: "2 hours"` → 2 hours
  - Example: `duration: "45 mins"` → 0.75 hours

### Method 2: Content Estimation (Fallback)
If no duration is provided:
- Counts words in chapter content
- Assumes 200 words per minute reading speed
- Converts to hours

### Rounding
- Rounds to 1 decimal place (e.g., 5.5 hours)
- Minimum value: 0.5 hours

## Example Calculations

### Example 1: Course with Duration Data
```javascript
chapters: [
  { duration: 60 },      // 1 hour
  { duration: "2 hours" }, // 2 hours
  { duration: "30 mins" }, // 0.5 hours
]
// Total: 3.5 hours
```

### Example 2: Course with Content Estimation
```javascript
chapters: [
  { content: "..." }, // 1000 words → ~5 mins → 0.08 hours
  { content: "..." }, // 2000 words → ~10 mins → 0.17 hours
]
// Total: 0.5 hours (minimum applied)
```

## Database Schema Update

### Firestore Collection: `users/{userId}/certificates/{certId}`

**New Field:**
```javascript
{
  certificateId: "a1B2c3D4e5F6",
  userId: "user@example.com",
  courseId: "course123",
  courseTitle: "Web Development",
  userName: "John Doe",
  completionDate: "January 15, 2026",
  chapterCount: 12,
  totalHours: 5.5,  // ← NEW FIELD
  issuedAt: Timestamp,
  verified: true
}
```

## API Response Update

### POST /api/certificates/generate

**Response includes totalHours:**
```json
{
  "success": true,
  "certificate": {
    "id": "cert123",
    "certificateId": "a1B2c3D4e5F6",
    "userId": "user@example.com",
    "courseId": "course123",
    "courseTitle": "Web Development",
    "userName": "John Doe",
    "completionDate": "January 15, 2026",
    "chapterCount": 12,
    "totalHours": 5.5,
    "issuedAt": "2026-01-15T10:30:00.000Z",
    "verified": true
  }
}
```

## Backward Compatibility

### Existing Certificates
- Old certificates without `totalHours` will show "Course Duration: N/A"
- No migration needed - field is optional
- New certificates will always include hours

### Fallback Handling
```javascript
const hoursText = totalHours 
  ? `Course Duration: ${totalHours} ${totalHours === 1 ? 'hour' : 'hours'}`
  : 'Course Duration: N/A';
```

## Files Modified

1. **src/app/api/certificates/generate/route.js**
   - Added hours calculation logic
   - Stores `totalHours` in database
   - Returns `totalHours` in API response

2. **src/components/certificates/CertificateGenerator.jsx**
   - Extracts `totalHours` from certificate data
   - Displays hours on certificate canvas
   - Handles missing hours gracefully

## Testing Checklist

- [ ] Generate certificate for course with duration data
- [ ] Generate certificate for course without duration data
- [ ] Verify hours display correctly on certificate
- [ ] Check hours are saved to Firestore
- [ ] Test with course having 1 hour (singular)
- [ ] Test with course having multiple hours (plural)
- [ ] Test with existing certificate (should show N/A)
- [ ] Download certificate and verify hours are visible
- [ ] Share certificate and verify hours are included

## Display Examples

### With Hours
```
Course Duration: 1 hour
Course Duration: 2.5 hours
Course Duration: 10 hours
```

### Without Hours (Old Certificates)
```
Course Duration: N/A
```

## Benefits

1. **Professional**: Shows course investment and commitment
2. **Credibility**: Demonstrates substantial learning time
3. **Portfolio**: Helps showcase learning achievements
4. **Transparency**: Clear indication of course depth
5. **Motivation**: Visible progress metric for learners

## Future Enhancements

Possible improvements:
- Add hours to certificate verification page
- Show hours breakdown by chapter
- Display hours in certificate list view
- Add hours to user profile statistics
- Track learning time vs estimated time
- Add badges for milestone hours (10h, 50h, 100h)
