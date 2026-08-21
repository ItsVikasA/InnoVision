# Pull Request Descriptions

This document provides ready-to-use descriptions for each of the four Pull Requests.

---

## 1. [Fix] Content Rendering Crash (#140)
**Branch**: `fix/issue-140-rendering-crash`

### Description
This PR addresses client-side crashes that occurred when the AI returned malformed content (non-string or null) for the 'para' type in chapters.

### Key Changes
- Modified [src/components/chapter_content/Content.jsx](file:///c:/Users/visha/Downloads/Innovision-Open-Source/src/components/chapter_content/Content.jsx) to safely handle `item.content` using type checking and array joining.
- Updated [src/components/MarkDown.jsx](file:///c:/Users/visha/Downloads/Innovision-Open-Source/src/components/MarkDown.jsx) to ensure `content` is always a string by providing a default empty string.

### Verification Plan
- Verified that the application no longer crashes when rendering chapters with unexpected content formats.

---

## 2. [Fix] Silent Chapter Generation Failures (#139)
**Branch**: `fix/issue-139-silent-generation-fail`

### Description
Prevents chapters from being deleted when AI generation fails or times out, allowing for better error tracking and retries.

### Key Changes
- Updated [src/app/api/chapter-prompt/route.js](file:///c:/Users/visha/Downloads/Innovision-Open-Source/src/app/api/chapter-prompt/route.js):
  - Documents are now marked with `process: "failed"` and populated with an error message instead of being deleted.
  - Switched the generation model to `gemini-3.7-flash`.
  - Implemented a 2-minute timeout in [cleanupStuckChapters](file:///c:/Users/visha/Downloads/Innovision-Open-Source/src/app/api/chapter-prompt/route.js#94-114).

### Verification Plan
- Tested and confirmed that failed generations now persist in the database with a 'failed' status rather than being deleted.

---

## 3. [UX] Add Failure handling and Retry for Chapters (#141)
**Branch**: `fix/issue-141-failed-chapter-retry`

### Description
Improves user experience by displaying informative error messages when a chapter fails to generate and providing a "Try Again" mechanism.

### Key Changes
- Modified [src/components/chapter_content/page.jsx](file:///c:/Users/visha/Downloads/Innovision-Open-Source/src/components/chapter_content/page.jsx):
  - Updated [fetchChapter](file:///c:/Users/visha/Downloads/Innovision-Open-Source/src/components/chapter_content/page.jsx#94-126) to detect `failed` status and set local error state.
  - Enhanced polling logic in [handlePendingChapter](file:///c:/Users/visha/Downloads/Innovision-Open-Source/src/components/chapter_content/page.jsx#127-170) to stop and reject the promise if the status becomes `failed`.

### Verification Plan
- Verified that users see a "Retry" option when a chapter generation fail, which correctly triggers a re-fetch.

---

## 4. [Feat] Add Course Archiving Feature (#104)
**Branch**: `feat/issue-104-course-archiving`

### Description
Introduces the ability to archive and unarchive courses, helping users organize their roadmaps without deleting them.

### Key Changes
- **API**: Added [PATCH](file:///c:/Users/visha/Downloads/Innovision-Open-Source/src/app/api/roadmap/%5Bid%5D/archive/route.js#5-53) method to `/api/roadmap/[id]` to toggle the `archived` status in Firestore.
- **Frontend**:
  - Integrated [ArchiveCourse](file:///c:/Users/visha/Downloads/Innovision-Open-Source/src/components/Home/ArchiveCourse.jsx#17-101) component into [CourseCard.jsx](file:///c:/Users/visha/Downloads/Innovision-Open-Source/src/components/Home/CourseCard.jsx).
  - Updated [src/app/roadmap/page.jsx](file:///c:/Users/visha/Downloads/Innovision-Open-Source/src/app/roadmap/page.jsx) to support filtering by "Active" and "Archived" courses.
  - Passed necessary props (`isArchived`, `onArchive`) through the component tree.

### Verification Plan
- Verified that courses can be toggled between active and archived states and are correctly filtered on the roadmap page.
