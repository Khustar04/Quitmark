# 🟩 Quitmark

> A modern, intelligent, and user-friendly habit tracking application designed to help users build consistency, maintain daily routines, track progress, and develop long-term positive habits.

---

## 📌 Overview

**Quitmark** is a full-stack web application designed to help users create, manage, and consistently follow their daily habits.

The core idea behind the application is simple:

> **Small actions repeated consistently can create meaningful long-term change.**

Many people set goals but struggle with consistency. Traditional to-do applications focus primarily on completing individual tasks, while Quitmark focuses on **repetition, consistency, streaks, progress, and behavioral patterns**.

This application provides users with a centralized platform where they can:

* Create personal habits
* Track habits every day
* Monitor completion history
* Maintain streaks
* Visualize their progress
* Receive reminders
* Configure notification preferences
* Manage their account and security
* Reset forgotten passwords securely
* Understand their consistency over time

The application is designed with a **modern Green-based interface**, responsive layouts, authentication, personalized dashboards, and a scalable architecture suitable for further development.

---

# 🎯 Project Goal

The primary goal of Quitmark is to solve one major problem:

### **How can users consistently build and maintain positive habits?**

Creating a habit is easy.

Maintaining it for weeks and months is difficult.

Quitmark attempts to solve this by combining:

* Daily tracking
* Visual progress
* Streak mechanics
* Reminders
* Notification preferences
* Historical data
* User-focused dashboards
* Consistency feedback

Instead of simply telling users what they should do, the application gives them a system for **building consistency and observing their progress**.

---

# 💡 Why Does This Project Exist?

People commonly use:

* Notes applications
* Calendars
* To-do applications
* Spreadsheets
* Phone reminders

to manage their routines.

However, these tools are not specifically designed around **habit formation**.

For example:

A user may want to:

* Read for 30 minutes every day
* Exercise every morning
* Practice coding
* Drink enough water
* Study English
* Meditate
* Sleep at a consistent time

A normal task manager might allow the user to create a task called:

> "Exercise"

But Quitmark treats it differently.

It understands that:

> "Exercise" is something the user wants to repeat consistently.

Therefore, the application focuses on:

**Habit → Daily Completion → Streak → Progress → Consistency**

---

# 🧠 Core Concept

The application is built around the following cycle:

```text
Create Habit
     ↓
Perform Habit
     ↓
Mark Habit Complete
     ↓
Streak Updated
     ↓
Progress Recorded
     ↓
User Receives Feedback
     ↓
Continue Habit
```

This creates a continuous feedback loop that encourages consistency.

---

# ✨ Main Features

## 1. 🔐 User Authentication

The application provides secure user authentication so that every user's habits and personal data remain associated with their own account.

Authentication functionality includes:

* User registration
* User login
* Session management
* Logout
* Protected application areas
* Authentication state handling
* Password management
* Password reset

Users cannot access another user's private habit information.

---

# 2. 📝 User Registration

New users can create an account by providing the required information.

Typical registration flow:

```text
Open Application
       ↓
Register
       ↓
Enter Account Information
       ↓
Submit Registration
       ↓
Account Created
       ↓
Login
       ↓
Dashboard
```

The registration system is designed to prevent unauthorized access and provide each user with an isolated workspace.

---

# 3. 🔑 Login System

Existing users can securely log into their accounts.

After successful authentication, the user is redirected to the main application/dashboard.

The authentication flow ensures that protected application functionality is available only to authenticated users.

---

# 4. 🔄 Forgot Password / Password Reset

The application includes a password recovery system for users who forget their passwords.

### Password reset flow

```text
Login
  ↓
Forgot Password
  ↓
Enter Email
  ↓
Reset Link
  ↓
Open Secure Reset Page
  ↓
Enter New Password
  ↓
Password Updated
  ↓
Redirect to Login
```

The password reset page is intentionally focused only on password recovery.

After a successful reset:

* The user is redirected to the login page.
* If an authenticated session exists, the session is invalidated/logged out before returning to login.

This prevents confusing authentication states after a password change.

---

# 5. 🏠 Dashboard

The dashboard acts as the central control panel of the application.

It provides users with a quick overview of their current habit activity.

The dashboard can contain information such as:

* Today's habits
* Completed habits
* Pending habits
* Current streak
* Longest streak
* Completion statistics
* Daily progress
* Recent activity
* Habit summaries

### Example conceptual layout

```text
--------------------------------------------------
                 QUITMARK
--------------------------------------------------

Today's Progress
████████████████░░░░ 80%

Completed: 4 / 5

--------------------------------------------------

Today's Habits

☑ Morning Exercise
☑ Read 30 Minutes
☐ Practice Coding
☑ Drink Water
☑ Meditation

--------------------------------------------------

Current Streak: 🔥 12 Days
Longest Streak: 🏆 27 Days

--------------------------------------------------
```

---

# 6. ➕ Create Habit

Users can create their own habits according to their personal goals.

A habit may contain information such as:

* Habit name
* Description
* Frequency
* Schedule
* Reminder configuration
* Status
* Creation date

Example:

```text
Habit:
Practice DSA

Frequency:
Daily

Reminder:
8:00 PM

Goal:
Practice at least one problem every day
```

The goal is to make habit creation flexible enough for different lifestyles.

---

# 7. ✏️ Edit Habit

Users can modify existing habits.

For example, users can change:

* Habit name
* Description
* Frequency
* Reminder
* Schedule
* Other configurable properties

This allows habits to evolve with the user's routine.

---

# 8. 🗑️ Delete Habit

Users can remove habits they no longer want to track.

The application should handle deletion carefully so that accidental deletion can be minimized through appropriate UI confirmation.

---

# 9. ✅ Daily Habit Completion

The most important interaction in the application is marking a habit as completed.

For example:

```text
☐ Read Book
```

After completing the habit:

```text
☑ Read Book
```

The completion event is stored and used for:

* Streak calculation
* Progress statistics
* Completion history
* Dashboard analytics
* Consistency tracking

---

# 10. 🔥 Streak System

The streak system is one of the core features of Quitmark.

A streak represents consecutive successful habit completion.

Example:

```text
Monday     ✅
Tuesday    ✅
Wednesday  ✅
Thursday   ✅
Friday     ✅

Current Streak = 5 Days 🔥
```

If the user misses a required completion:

```text
Monday     ✅
Tuesday    ✅
Wednesday  ❌

Streak may be broken.
```

The application calculates streaks based on actual completion history rather than simply counting total completed habits.

---

# 11. 📊 Progress Tracking

The application records historical habit activity so users can understand their consistency.

Progress can include:

* Daily completion rate
* Weekly completion
* Monthly completion
* Current streak
* Longest streak
* Completed habits
* Missed habits
* Historical activity

The purpose is not only to show whether a habit was completed today, but also to help users understand their **long-term behavior**.

---

# 12. 📅 Habit History

Users can review their previous habit activity.

For example:

```text
September 2026

Mon  Tue  Wed  Thu  Fri  Sat  Sun
 ✅   ✅   ❌   ✅   ✅   ✅   ❌
```

This gives users visibility into their consistency patterns.

Historical tracking also provides the foundation for future analytics features.

---

# 13. 🔔 Notification Permission System

Notifications are treated as an explicit user permission.

The application follows a permission lifecycle:

```text
Permission Not Requested
          ↓
Request Permission
       ↙     ↘
  Granted    Denied
```

The application does **not** unnecessarily request notification permission immediately when the page loads.

Instead, permission can be requested during an appropriate user interaction, such as when the user enables reminders.

This creates a better user experience and avoids unexpected browser permission prompts.

---

# 14. ⏰ Habit Reminders

Users can receive reminders for habits they need to complete.

Example:

```text
8:00 AM
↓
Reminder
↓
"Time to complete your Morning Exercise."
```

Reminders are intended to help users remember their routines without requiring them to manually check the application constantly.

---

# 15. 🔥 Streak-Break Detection

The application can detect when a user's habit consistency is at risk.

Conceptually:

```text
Habit Active
     ↓
Today's completion missing
     ↓
Check current streak
     ↓
Streak potentially breaks
     ↓
Trigger reminder
```

This functionality forms the foundation for intelligent streak-protection notifications.

---

# 16. 🚨 Streak Reminder Notifications

When a user has an active streak but has not completed a habit during the required period, the system can provide a reminder.

Example:

> "You haven't completed your habit today. Keep your streak alive!"

The goal is to provide timely feedback before a streak is lost.

---

# 17. 🕐 Multiple Daily Reminder Windows

The notification system can support multiple reminder windows during a day.

For example:

```text
Morning Reminder
        ↓
Afternoon Reminder
        ↓
Evening Reminder
```

This allows the application to accommodate users who have different schedules.

For example:

```text
Morning:
8:00 AM

Afternoon:
2:00 PM

Evening:
8:00 PM
```

The exact notification behavior can be controlled through user preferences.

---

# 18. ⚙️ Notification Preferences

Users should have control over how notifications work.

Possible preferences include:

* Enable/disable notifications
* Reminder timing
* Streak reminders
* Daily reminders
* Notification windows
* Other notification categories

The settings system ensures that notifications remain user-controlled rather than forced.

---

# 19. ⚙️ Settings

The Settings section provides users with control over their application experience.

Possible settings include:

### Account

* Profile information
* Account management
* Password management

### Notifications

* Notification permission
* Reminder preferences
* Streak reminders
* Daily reminder windows

### Application

* Interface preferences
* Other application settings

The settings architecture is designed to allow additional preferences to be added in the future.

---

# 20. 🌙 Dark Mode

The application supports a modern interface with a dark-mode experience.

The visual design is based around a **blue-oriented color system**, while the dark mode provides an alternative appearance suitable for low-light environments.

The interface is designed to maintain:

* Readability
* Contrast
* Visual hierarchy
* Consistent component styling
* Usability across themes

---

# 21. 📱 Responsive Design

Quitmark is designed to work across different screen sizes.

Supported experiences include:

* Desktop
* Laptop
* Tablet
* Mobile browser

The UI adapts to different viewport sizes so that users can manage habits from different devices.

---

# 🖼️ Screenshots

> Replace the placeholders below with actual screenshots from the application.

## Landing Page

The landing page introduces the application and explains its core purpose.

![Landing Page](./screenshots/landing-page.png)

---

## Login

Authentication interface for existing users.

![Login](./screenshots/login.png)

---

## Registration

Account creation interface for new users.

![Registration](./screenshots/register.png)

---

## Dashboard

The primary interface where users can view their habits and progress.

![Dashboard](./screenshots/dashboard.png)

---

## Habit Management

Interface for creating, editing, and managing habits.

![Habit Management](./screenshots/habit-management.png)

---

## Habit Progress

Visual representation of habit completion and consistency.

![Progress](./screenshots/progress.png)

---

## Notifications

Notification configuration and reminder settings.

![Notifications](./screenshots/notifications.png)

---

## Settings

Application and account configuration.

![Settings](./screenshots/settings.png)

---

## Password Reset

Secure password recovery interface.

![Password Reset](./screenshots/password-reset.png)

---

# 👤 Typical User Journey

A typical user experience looks like this:

```text
                    Landing Page
                         │
                         ▼
                Register / Login
                         │
                         ▼
                     Dashboard
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
       Create Habit   View Stats   Settings
            │
            ▼
       Complete Habit
            │
            ▼
       Streak Updated
            │
            ▼
       Progress Recorded
            │
            ▼
       Reminder System
            │
            ▼
      Continue Consistency
```

---

# 🏗️ Application Architecture

The project follows a modern client-server architecture.

```text
                 ┌─────────────────────┐
                 │       User          │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   React Frontend    │
                 │                     │
                 │ UI / State / Forms  │
                 └──────────┬──────────┘
                            │
                         API Calls
                            │
                            ▼
                 ┌─────────────────────┐
                 │      Backend        │
                 │   / API Services    │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │      Database       │
                 │                     │
                 │ Users / Habits /    │
                 │ Progress / Settings │
                 └─────────────────────┘
```

---

# 🧰 Technology Stack

## Frontend

### React.js

React is used to build the application's interactive user interface.

It provides:

* Component-based architecture
* Reusable UI components
* Dynamic rendering
* State management
* Client-side application behavior

---

### Tailwind CSS

Tailwind CSS is used for styling the application.

It provides:

* Responsive layouts
* Utility-based styling
* Consistent spacing
* Responsive breakpoints
* Dark mode support
* Rapid UI development

---

### JavaScript / TypeScript

The frontend uses modern web development practices for:

* Application logic
* API communication
* Event handling
* State management
* UI interactions

---

# 🗄️ Database

The application requires persistent storage because user habits and completion records need to survive between sessions.

The database stores information such as:

```text
Users
Habits
Habit Completions
Streak Information
Notification Preferences
Account Information
```

---

# ☁️ Supabase

Supabase can provide several backend infrastructure capabilities depending on the deployed architecture.

Potential responsibilities include:

* Authentication
* PostgreSQL database
* User management
* Backend services
* Database access
* Secure data storage

Supabase provides a managed backend platform that reduces the amount of infrastructure that needs to be maintained manually.

---

# 🔐 Authentication & Security

Security is an important part of the application because users' habits and account information are private.

Security considerations include:

* Authenticated user sessions
* Protected routes
* User-specific data access
* Secure password recovery
* Database access policies
* Input validation
* Authorization checks
* Secure environment variables

Sensitive credentials and API keys should never be committed to the Git repository.

---

# 🌐 APIs

The frontend communicates with backend services through APIs.

Typical API responsibilities include:

```text
Authentication
    ↓
User Management
    ↓
Habit Management
    ↓
Habit Completion
    ↓
Progress
    ↓
Notifications
    ↓
Settings
```

An API-based architecture also makes it easier to build additional clients in the future, such as:

* Mobile applications
* Desktop applications
* Third-party integrations

---

# 📦 Important Technologies

| Technology              | Purpose                        |
| ----------------------- | ------------------------------ |
| React                   | Frontend UI                    |
| Tailwind CSS            | Styling & responsive design    |
| JavaScript / TypeScript | Application logic              |
| Supabase                | Backend infrastructure         |
| PostgreSQL              | Persistent database            |
| Authentication          | User identity & access         |
| REST APIs               | Frontend/backend communication |
| Git                     | Version control                |
| GitHub                  | Source code hosting            |
| Vercel                  | Frontend deployment            |
| Browser Notifications   | Habit reminders                |
| Email Service           | Account/password communication |

---

# ☁️ Platforms & Services

## GitHub

Used for:

* Source code management
* Version control
* Collaboration
* Issue tracking
* Project documentation

---

## Vercel

Used for deploying the web application.

Benefits include:

* Fast deployment
* Automatic builds
* Git integration
* Production hosting
* Preview deployments
* Scalable frontend infrastructure

---

## Supabase

Used for backend infrastructure and managed services such as authentication and database functionality.

---

## Browser Notification APIs

The notification functionality uses browser-supported notification capabilities to deliver reminders when permission has been granted by the user.

---

# 🗂️ Suggested Project Structure

```text
quitmark/
│
├── public/
│   ├── favicon
│   └── assets/
│
├── src/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── habits/
│   │   ├── dashboard/
│   │   └── notifications/
│   │
│   ├── pages/
│   │   ├── Landing/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Dashboard/
│   │   ├── Settings/
│   │   └── ResetPassword/
│   │
│   ├── services/
│   │   ├── auth/
│   │   ├── habits/
│   │   └── notifications/
│   │
│   ├── hooks/
│   │
│   ├── utils/
│   │   ├── streak/
│   │   └── notifications/
│   │
│   ├── contexts/
│   │
│   ├── styles/
│   │
│   ├── App
│   └── main
│
├── screenshots/
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

> The exact structure may differ depending on the final implementation.

---

# 🔄 Core Application Logic

## Habit Completion

Conceptually:

```text
User clicks Complete
        ↓
Validate authenticated user
        ↓
Identify habit
        ↓
Record completion
        ↓
Update progress
        ↓
Calculate streak
        ↓
Update dashboard
```

---

# 🔥 Streak Calculation

The streak system is based on completion dates.

Conceptually:

```text
Completion History

Day 1 → ✅
Day 2 → ✅
Day 3 → ✅
Day 4 → ✅
Day 5 → ❌

Current Streak → 0
Previous Streak → 4
```

The exact calculation depends on the habit's frequency and scheduling rules.

This distinction is important because:

> **Total completions ≠ Current streak**

A user could have completed a habit 100 times historically but currently have a 0-day streak.

---

# 🔔 Notification Architecture

The notification system follows a permission-first approach.

```text
User
 │
 ▼
Notification Settings
 │
 ▼
Permission Status
 │
 ├── Not Requested
 │       │
 │       ▼
 │   Request Permission
 │
 ├── Granted
 │       │
 │       ▼
 │   Enable Reminders
 │
 └── Denied
         │
         ▼
   Respect Browser Decision
```

The system should never attempt to bypass browser notification permissions.

---

# 🎨 Design Philosophy

The application follows a modern productivity-product design philosophy.

Key principles include:

### Simplicity

Users should be able to understand their daily status quickly.

### Consistency

UI components should maintain consistent spacing, typography, buttons, cards, and interactions.

### Feedback

Users should immediately understand whether a habit was completed and how it affects their progress.

### Focus

The dashboard should emphasize the user's current actions rather than overwhelming them with unnecessary information.

### Responsiveness

The interface should remain usable across desktop and mobile devices.

---

# 🧩 Product Modules

The project can be divided into several major modules.

```text
Quitmark
│
├── Authentication
│   ├── Register
│   ├── Login
│   ├── Logout
│   └── Password Reset
│
├── Habit Management
│   ├── Create
│   ├── Read
│   ├── Update
│   └── Delete
│
├── Tracking
│   ├── Completion
│   ├── History
│   └── Progress
│
├── Streak System
│   ├── Current Streak
│   ├── Longest Streak
│   └── Break Detection
│
├── Notifications
│   ├── Permission
│   ├── Reminders
│   ├── Streak Alerts
│   └── Preferences
│
└── Settings
    ├── Account
    ├── Notifications
    └── Application Preferences
```

---

# 🧪 Testing

Testing should cover both individual functionality and complete user flows.

Important test cases include:

### Authentication

* Register with valid information
* Register with invalid information
* Login with valid credentials
* Login with incorrect credentials
* Logout
* Forgot password
* Reset password

### Habits

* Create habit
* Edit habit
* Delete habit
* Complete habit
* Prevent invalid completion
* View history

### Streaks

* Start streak
* Continue streak
* Break streak
* Calculate longest streak
* Handle missed days

### Notifications

* Permission not requested
* Permission granted
* Permission denied
* Enable notifications
* Disable notifications
* Reminder scheduling
* Streak reminder

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone <repository-url>
```

---

## 2. Navigate to Project

```bash
cd Quitmark---AI-based-Habit-tracker
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file.

Example:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Add other environment variables required by the final implementation.

---

## 5. Start Development Server

```bash
npm run dev
```

The application should then be available through the local development server.

---

# 🏭 Production Build

Create a production build using:

```bash
npm run build
```

To locally preview the production build:

```bash
npm run preview
```

---

# 🔒 Environment Variables

Environment variables should contain configuration that should not be hardcoded into the source code.

Examples:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
API_URL
EMAIL_SERVICE_KEY
OTHER_SERVICE_KEYS
```

Never commit sensitive credentials to GitHub.

---

# 📈 Scalability

The current application can be extended significantly.

Potential architectural improvements include:

```text
Current
React
  ↓
Supabase
  ↓
PostgreSQL

Future
React
  ↓
API Gateway
  ↓
Backend Services
  ↓
PostgreSQL
  ↓
Redis
  ↓
Notification Service
```

As the number of users increases, additional infrastructure can be introduced without changing the fundamental product concept.

---

# 🚀 Future Improvements

The project is designed as a foundation for a much larger productivity and habit-management platform.

Potential future features include:

## 📊 Advanced Analytics

Future analytics could include:

* Weekly reports
* Monthly reports
* Completion trends
* Habit consistency score
* Best-performing days
* Missed-habit analysis
* Long-term progress

---

## 🧠 Habit Recommendations

The system could recommend habits based on:

* User goals
* Existing habits
* Completion patterns
* Preferred schedule

---

## 🏆 Gamification

Potential features:

* Achievements
* Badges
* Levels
* XP
* Milestones
* Challenges

Example:

```text
🔥 7-Day Streak
🏆 30-Day Streak
💎 100 Completions
⭐ First Month Completed
```

---

## 👥 Social Features

Future versions could introduce:

* Friends
* Habit challenges
* Shared goals
* Leaderboards
* Accountability partners

These features would require additional privacy and moderation considerations.

---

## 📱 Mobile Application

The web application could eventually be extended into:

* Android application
* iOS application

Potential technologies include:

* React Native
* Flutter

The existing API architecture could support these clients.

---

## 🔔 Advanced Notifications

Future notification infrastructure could support:

* Push notifications
* Email reminders
* Intelligent reminder timing
* Weekly summaries
* Monthly reports
* Streak warnings
* Personalized reminders

---

# 🛡️ Security Considerations

Security should remain a core part of the project as functionality grows.

Important practices include:

* Never expose private credentials
* Use secure authentication
* Validate user input
* Apply authorization rules
* Restrict database access
* Protect API endpoints
* Use HTTPS in production
* Secure password reset tokens
* Avoid storing plaintext passwords
* Protect environment variables

---

# 📊 Example Data Model

A simplified conceptual model may look like:

```text
User
 │
 ├── Habits
 │     │
 │     ├── Habit
 │     │      │
 │     │      └── Completions
 │     │
 │     └── Habit
 │
 └── Notification Preferences
```

A possible database design:

```text
users
-----
id
email
created_at

habits
------
id
user_id
name
description
frequency
created_at

habit_completions
-----------------
id
habit_id
completed_at

notification_preferences
------------------------
id
user_id
notifications_enabled
streak_reminders_enabled
```

The actual schema can evolve according to implementation requirements.

---

# 🌍 Deployment

The project is designed to be deployed as a modern web application.

Possible deployment architecture:

```text
                    GitHub
                       │
                       ▼
                    Vercel
                       │
                       ▼
                React Application
                       │
                       ▼
                    Supabase
                  /          \
                 ▼            ▼
           PostgreSQL      Auth
```

---

# 💻 Supported Platforms

Quitmark is primarily designed for:

* 🌐 Modern web browsers
* 💻 Windows
* 🍎 macOS
* 🐧 Linux
* 📱 Android browsers
* 📱 iOS browsers
* 📲 Responsive mobile screens

Browser notification functionality depends on browser support and the permissions granted by the user.

---

# 📋 Project Status

### Current Development

The project currently focuses on:

* Authentication
* Habit management
* Daily tracking
* Streak tracking
* Progress
* Notification permission handling
* Streak-break detection
* Reminder notifications
* Notification preferences
* Account settings
* Password reset
* Responsive UI
* Dark mode

Additional features can be added incrementally as the project evolves.

---

# 🗺️ Development Roadmap

```text
Phase A
│
├── Project Foundation
├── UI
└── Authentication
        ↓
Phase B
│
├── Habit Management
├── CRUD
└── Daily Tracking
        ↓
Phase C
│
├── Streaks
├── History
└── Progress
        ↓
Phase D
│
├── Notification Permissions
├── Streak-Break Detection
├── Streak Reminders
├── Daily Reminder Windows
└── Notification Preferences
        ↓
Phase E
│
├── Advanced Analytics
└── Personalization
        ↓
Phase F
│
├── Mobile Application
├── Social Features
└── Advanced Infrastructure
```

---

# 🎓 What This Project Demonstrates

This project is not only a habit tracking application; it also demonstrates practical software engineering concepts.

### Frontend Development

* React component architecture
* Responsive UI
* State management
* Form handling
* Routing
* API integration
* Theme management

### Backend / Cloud Development

* Authentication
* Database design
* CRUD operations
* API communication
* Authorization
* Persistent data

### Product Engineering

* User onboarding
* User flows
* Notification systems
* Error handling
* Settings management
* Account recovery

### Software Engineering

* Modular architecture
* Reusable components
* Environment configuration
* Version control
* Deployment
* Security considerations
* Testing

---

# 🎯 Long-Term Vision

The long-term vision is to evolve Quitmark from a simple tracking application into a **personal consistency and productivity platform**.

The future system could combine:

```text
Habit Tracking
      +
Behavior Analytics
      +
Personalized Recommendations
      +
Notifications
      +
Gamification
      +
Progress Analytics
```

The objective would be to create a system that does more than record completed habits.

It should help users understand:

> **What they are doing, how consistently they are doing it, where they struggle, and how they can improve their routine.**

---

# 🤝 Contributing

Contributions can help improve the project.

A typical contribution workflow:

```bash
git clone <repository-url>

git checkout -b feature/new-feature

git add .

git commit -m "Add new feature"

git push origin feature/new-feature
```

Then create a Pull Request.

Before submitting a contribution, ensure that:

* Existing functionality is not broken
* Code is clean and maintainable
* New functionality is tested
* Sensitive credentials are not committed
* Documentation is updated where necessary

---

# 📄 License

Add the project's chosen license here.

Example:

```text
MIT License
```

---

# 👨💻 Author

## Khustar Hussain

B.Tech graduate and Java Backend Developer interested in:

* Full-stack development
* Java
* Spring Boot
* Backend engineering
* System design
* Data Structures & Algorithms

---

# ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

Your feedback, suggestions, and contributions are welcome.

---

# 📌 Final Summary

**Quitmark** is a full-stack productivity application built around one fundamental principle:

> ### Consistency creates progress.

The application provides users with the tools required to create habits, track daily completion, maintain streaks, monitor progress, configure reminders, and manage their account securely.

It combines a modern responsive interface with persistent data, authentication, notification functionality, and a scalable foundation for future analytics, gamification, and mobile capabilities.

The project is designed not simply as a CRUD application, but as a foundation for a **real-world productivity product** that can evolve over time.
