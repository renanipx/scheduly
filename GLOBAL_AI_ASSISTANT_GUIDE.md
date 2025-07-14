# 🤖 Global AI Assistant Guide

## Overview
The Global AI Assistant is a floating action button that appears on all dashboard pages (Tasks, Calendar, Settings) and provides intelligent assistance for creating tasks, events, and managing settings using natural language.

## How to Access
The AI Assistant is always available as a **floating action button (🤖)** in the bottom-right corner of any dashboard page. Simply click the button to open the AI chat interface.

## Features by Page

### 📋 Tasks Page
**What you can do:**
- Create tasks using natural language
- Set dates, times, and descriptions automatically

**Example commands:**
```
✅ "Meeting with client tomorrow at 2pm for 1 hour"
✅ "Review project documents on Friday from 9am to 11am"
✅ "Call supplier next Monday at 3pm"
✅ "Prepare presentation for Wednesday 10am-12pm"
```

**What happens:**
1. AI extracts task information
2. Automatically fills the task form
3. You can review and modify details
4. Click "Create Task" to save

### 📅 Calendar Page
**What you can do:**
- Create calendar events using natural language
- Schedule meetings and appointments

**Example commands:**
```
✅ "Team meeting tomorrow at 10am for 2 hours"
✅ "Client presentation on Friday from 2pm to 4pm"
✅ "Doctor appointment next Tuesday at 3pm"
✅ "Birthday party on Saturday 6pm-10pm"
```

**What happens:**
1. AI extracts event information
2. Opens event creation form
3. Pre-fills all details
4. You can review and save the event

### ⚙️ Settings Page
**What you can do:**
- Get guidance on changing settings
- Navigate to specific settings sections

**Example commands:**
```
✅ "Change my password"  
_Note: The AI Assistant will provide you with step-by-step instructions on how to change your password in the Settings page, but will not change your password automatically. You need to follow the instructions to complete the process yourself._
✅ "Update my email preferences"
✅ "Modify notification settings"
✅ "Change theme to dark mode"
✅ "Update profile information"
```

**What happens:**
1. AI provides specific guidance
2. Shows relevant settings sections
3. Helps you navigate to the right place

## Supported Date Formats

### Relative Dates
- **"tomorrow"** or **"tmr"** - Next day
- **"today"** - Current day
- **"next Monday/Tuesday/etc."** - Next occurrence of that day
- **"this Monday/Tuesday/etc."** - This week's occurrence

### Specific Dates
- **"2024-01-15"** - ISO format
- **"15/01/2024"** - DD/MM/YYYY format

## Supported Time Formats

### 12-Hour Format
- **"2pm"** or **"2:30pm"**
- **"10am"** or **"10:30am"**

### 24-Hour Format
- **"14:00"** or **"14:30"**
- **"09:00"** or **"09:30"**

### Time Ranges
- **"from 9am to 11am"**
- **"9am-11am"**
- **"2pm for 1 hour"** (AI calculates end time)

## How It Works

### 1. **Context Awareness**
The AI automatically detects which page you're on and adapts its responses accordingly:
- **Tasks page** → Task creation assistance
- **Calendar page** → Event creation assistance  
- **Settings page** → Settings guidance

### 2. **Natural Language Processing**
The AI understands various ways to express the same thing:
```
"Meeting tomorrow at 2pm" = "Meeting with client tomorrow at 2:00 PM"
"Call next Monday 3pm" = "Phone call next Monday at 15:00"
"Review docs Friday 9-11" = "Review documents on Friday from 9:00 to 11:00"
```

### 3. **Smart Defaults**
When you don't specify certain details, the AI makes intelligent assumptions:
- **No end time** → Adds 1 hour to start time
- **No date** → Uses today or tomorrow based on context
- **No title** → Creates title from description

### 4. **Form Integration**
After processing your request, the AI:
- Fills in the appropriate form fields
- Shows you what it understood
- Lets you review and modify before saving

## Tips for Best Results

### ✅ **Be Specific**
```
Good: "Team meeting tomorrow at 10am for 2 hours"
Better: "Weekly team meeting tomorrow at 10am for 2 hours to discuss Q4 goals"
```

### ✅ **Include Key Information**
- **What** you need to do
- **When** (date and time)
- **How long** it will take (optional)

### ✅ **Use Natural Language**
```
Good: "Meeting with client tomorrow at 2pm"
Avoid: "Create task meeting client tomorrow 2pm"
```

### ✅ **Be Clear About Duration**
```
Good: "Review documents for 2 hours on Friday"
Good: "Call supplier tomorrow at 3pm for 30 minutes"
```

## Troubleshooting

### **AI doesn't understand my request**
- Make sure you include a date reference
- Include a time reference
- Try rephrasing with more specific details

### **Wrong information extracted**
- You can always edit the form manually
- Try being more specific in your description
- Use standard date/time formats

### **AI assistant not responding**
- Check your internet connection
- Refresh the page and try again
- Make sure you're on a dashboard page

## Advanced Features

### **Multi-language Support**
The AI understands commands in multiple languages:
```
English: "Meeting tomorrow at 2pm"
Portuguese: "Reunião amanhã às 14h"
Spanish: "Reunión mañana a las 2pm"
```

### **Context Switching**
You can switch between different types of requests:
```
"Create a task for tomorrow's meeting"
"Now help me change my password"
"Schedule a team event for Friday"
```

### **Smart Suggestions**
The AI provides helpful examples and suggestions when it can't understand your request, helping you learn the best way to communicate with it.

---

## Quick Reference

| Page | What to Say | What Happens |
|------|-------------|--------------|
| **Tasks** | "Meeting tomorrow at 2pm" | Creates task with date/time |
| **Calendar** | "Team event Friday 6pm" | Creates calendar event |
| **Settings** | "Change my password" | Shows password change guidance |

**Remember:** The AI assistant is designed to help, not replace manual input. Always review the extracted information before saving! 