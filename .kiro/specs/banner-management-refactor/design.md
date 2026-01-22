# Design Document: Banner Management Refactor

## Overview

This design outlines the refactoring of the existing monolithic `PromoBannerAdmin` component into a modular, maintainable component architecture. The refactor will separate concerns while preserving all existing functionality and API integrations.

## Architecture

The new architecture follows a hierarchical component structure with clear separation of concerns:

```
PromoBannerAdmin (Main Container)
├── BannerList (List Management)
│   ├── BannerCard (Individual Banner Display)
│   └── EmptyState (No Banners State)
├── BannerFormModal (Modal Wrapper)
│   └── BannerForm (Form Logic)
└── LoadingSpinner (Loading State)
```

### Component Responsibilities

- **PromoBannerAdmin**: Main container, state management, API orchestration
- **BannerList**: Banner display logic, responsive layouts
- **BannerCard**: Individual banner presentation and actions
- **BannerFormModal**: Modal wrapper with backdrop and positioning
- **BannerForm**: Form logic, validation, and submission
- **EmptyState**: Empty state presentation
- **LoadingSpinner**: Loading state presentation

## Components and Interfaces

### PromoBannerAdmin (Main Container)

**Props**: None (root component)

**State**:
```javascript
{
  banners: Banner[],
  loading: boolean,
  showFormModal: boolean,
  editBannerId: string | null
}
```

**Key Methods**:
- `fetchBanners()`: Loads banners from API
- `handleCreateBanner()`: Opens form modal in create mode
- `handleEditBanner(id)`: Opens form modal in edit mode
- `handleDeleteBanner(id)`: Deletes banner with confirmation
- `handleToggleStatus(id)`: Toggles banner active status
- `handleFormClose()`: Closes form modal and refreshes data

### BannerList Component

**Props**:
```javascript
{
  banners: Banner[],
  loading: boolean,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  onToggleStatus: (id: string) => void,
  onRefresh: () => void,
  onCreateNew: () => void
}
```

**Responsibilities**:
- Render banner grid/list based on screen size
- Handle empty state display
- Provide refresh and create new actions
- Pass actions to individual banner cards

### BannerCard Component

**Props**:
```javascript
{
  banner: Banner,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  onToggleStatus: (id: string) => void
}
```

**Banner Interface**:
```javascript
{
  _id: string,
  title?: string,
  description?: string,
  bannerImage: string,
  isActive: boolean,
  displayOrder: number,
  createdBy?: { userName: string },
  createdAt: string
}
```

### BannerFormModal Component

**Props**:
```javascript
{
  isOpen: boolean,
  bannerId?: string | null,
  onClose: () => void
}
```

**Responsibilities**:
- Provide modal backdrop and positioning
- Handle modal open/close animations
- Prevent background interaction
- Responsive modal sizing

### BannerForm Component

**Props**:
```javascript
{
  bannerId?: string | null,
  onClose: () => void,
  onSuccess?: () => void
}
```

**State**:
```javascript
{
  form: {
    title: string,
    description: string,
    bannerImage: File | null,
    imagePreview: string,
    isActive: boolean,
    displayOrder: number
  },
  loading: boolean,
  errors: Record<string, string>
}
```

## Data Models

### Banner Model
```javascript
{
  _id: string,
  title?: string,
  description?: string,
  bannerImage: string,
  isActive: boolean,
  displayOrder: number,
  createdBy?: {
    userName: string,
    _id: string
  },
  createdAt: string,
  updatedAt: string
}
```

### Form Data Model
```javascript
{
  title: string,
  description: string,
  bannerImage: File | null,
  imagePreview: string,
  isActive: boolean,
  displayOrder: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all testable properties from the prework analysis, I identified several areas where properties can be consolidated:

- Properties 2.5, 6.3, and 5.3 all test the same behavior: successful form submission should close modal and refresh list
- Properties 2.6, 3.6, and 5.4 all test error handling and message display
- Properties 4.1 and 4.2 can be combined into a single property about banner information display
- Properties 8.2 and 8.3 can be combined into a single responsive layout property

The following properties provide unique validation value after consolidation:

Property 1: System functionality preservation
*For any* banner management operation that worked in the original system, the refactored system should maintain the same behavior and results
**Validates: Requirements 1.2**

Property 2: Form initialization with banner data
*For any* existing banner, when the edit form is opened, all form fields should be populated with the current banner's data
**Validates: Requirements 2.2**

Property 3: Form validation before submission
*For any* form submission attempt with invalid data, the form should prevent submission and display appropriate validation errors
**Validates: Requirements 2.3**

Property 4: Successful form submission workflow
*For any* valid form submission, the form should submit to the API, close the modal, and refresh the banner list
**Validates: Requirements 2.5, 6.3, 5.3**

Property 5: Error handling and user feedback
*For any* API error or operation failure, the system should display user-friendly error messages without crashing
**Validates: Requirements 2.6, 3.6, 5.4**

Property 6: Dual operation mode support
*For any* banner form instance, it should correctly handle both create mode (empty form) and edit mode (pre-populated form) operations
**Validates: Requirements 2.7**

Property 7: Loading state management
*For any* API operation, the system should display loading indicators during the operation and hide them when complete
**Validates: Requirements 3.2, 7.5**

Property 8: Banner information display completeness
*For any* banner, the banner card should display all required information including image, title, description, status, creation date, and creator
**Validates: Requirements 4.1, 4.2**

Property 9: Banner action availability
*For any* banner card, all required actions (edit, delete, status toggle) should be available and functional
**Validates: Requirements 4.3**

Property 10: Delete confirmation behavior
*For any* delete action, a confirmation dialog should appear before proceeding with the deletion
**Validates: Requirements 4.4**

Property 11: Status toggle functionality
*For any* banner, toggling its status should update the banner via API and reflect the change in the UI
**Validates: Requirements 4.5**

Property 12: Responsive layout adaptation
*For any* screen size, the banner list should display in the appropriate layout (grid for desktop, stacked for mobile)
**Validates: Requirements 8.2, 8.3**

Property 13: Component communication integrity
*For any* child component action, the appropriate parent component callback should be triggered with correct parameters
**Validates: Requirements 7.2, 7.3, 7.4**

Property 14: FormData structure consistency
*For any* form submission with image upload, the FormData should be constructed with the correct structure expected by the API
**Validates: Requirements 5.5**

Property 15: Modal state management
*For any* modal interaction, opening should show the modal with correct mode, and closing should hide the modal without saving changes
**Validates: Requirements 6.2, 6.4**

## Error Handling

### Form Validation Errors
- Required field validation with specific error messages
- File size validation (5MB limit) with user-friendly feedback
- Image format validation for uploaded files
- Display order numeric validation

### API Error Handling
- Network connectivity errors with retry suggestions
- Server errors (500) with generic user-friendly messages
- Authentication errors (401) with login redirection
- Not found errors (404) with appropriate messaging
- Validation errors from server with field-specific feedback

### Component Error Boundaries
- Wrap each major component in error boundaries
- Graceful degradation when child components fail
- Error reporting for debugging purposes
- Fallback UI for critical failures

## Testing Strategy

### Unit Testing Approach
- Test individual component rendering and behavior
- Mock API calls for isolated component testing
- Test form validation logic independently
- Test utility functions and data transformations
- Focus on edge cases like empty states and error conditions

### Property-Based Testing Configuration
- Use React Testing Library with Jest for component testing
- Configure property tests to run minimum 100 iterations each
- Generate random banner data for comprehensive testing
- Test responsive behavior across different viewport sizes
- Each property test must reference its design document property using format: **Feature: banner-management-refactor, Property {number}: {property_text}**

### Integration Testing
- Test complete user workflows (create, edit, delete banners)
- Test API integration with actual service calls
- Test modal interactions and state management
- Test responsive behavior across device sizes
- Test error scenarios and recovery paths

### Testing Tools and Libraries
- **Jest**: Primary testing framework
- **React Testing Library**: Component testing utilities
- **MSW (Mock Service Worker)**: API mocking for tests
- **fast-check**: Property-based testing library for JavaScript
- **@testing-library/user-event**: User interaction simulation

The testing strategy emphasizes both unit tests for specific examples and edge cases, and property-based tests for universal correctness properties. Together, these provide comprehensive coverage ensuring the refactored system maintains all existing functionality while improving code organization.