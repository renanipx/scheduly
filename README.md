# Chronoly

Chronoly is an AI-powered scheduling and task management platform designed to help users organize their daily activities, manage tasks, and automate calendar events with ease.

## Features
- **AI Assistant**: Create tasks, events, and change settings using natural language (English or Portuguese).
- **Task & Calendar Management**: Add, edit, and view tasks and events in a modern dashboard.
- **PDF/XLSX Export**: Export task reports for any week or month as PDF or Excel, with automatic email delivery and instant download.
- **Email & WhatsApp Integration**: Receive notifications and reports directly in your inbox or WhatsApp.
- **Google Calendar Sync**: (Optional) Integrate with Google Calendar for seamless event management.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB, Passport, PDFKit, ExcelJS, Nodemailer
- **Frontend**: React, Context API, modern CSS

## Getting Started
1. **Clone the repository**
2. **Install dependencies**
   - Backend: `cd backend && npm install`
   - Frontend: `cd ../frontend && npm install`
3. **Configure environment variables**
   - Copy `.env.example` to `.env` in `backend/` and set MongoDB URI, email credentials, etc.
4. **Run the application**
   - Backend: `npm start` (from `backend/`)
   - Frontend: `npm start` (from `frontend/`)

## Usage
- **Login/Register**: Create an account or log in.
- **AI Assistant**: Click the 🤖 button to open the assistant. Type requests like:
  - "Create a meeting tomorrow at 2pm"
  - "Give me the report for July in PDF"
  - "Change my password"
- **Export Reports**: Ask the assistant for a report (week/month, PDF/XLSX). The file will be downloaded and sent to your email.

## License
MIT 