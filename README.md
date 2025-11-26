# N8N Booking System Documentation

A comprehensive booking system built with N8N that integrates with Google Calendar to manage appointment scheduling with automatic availability checking and email confirmations.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Workflows](#workflows)
  - [Available Time Slot Checker](#1-available-time-slot-checker)
  - [Booking Processor](#2-booking-processor)
- [Demo](#demo)
- [Setup Instructions](#setup-instructions)
- [Docker Deployment](#docker-deployment)
- [API Reference](#api-reference)

## Overview

This booking system consists of two interconnected N8N workflows that handle appointment scheduling:

1. **Available Time Slot Checker** - Queries calendar availability for a specific date
2. **Booking Processor** - Validates and creates new bookings with calendar integration

The system uses Google Calendar as the backend and provides REST API endpoints for integration with websites or applications.

## Features

-  Real-time calendar availability checking
-  Automated booking validation
-  Google Calendar integration
-  Email confirmation notifications
-  Time slot conflict prevention
-  Docker container deployment with PostgreSQL
-  Persistent data storage
-  Web-based demo interface
-  Database management with pgAdmin

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Google Cloud Project with Calendar API enabled

### 1. Clone and Deploy
```bash
# Clone the project (if applicable)
git clone https://github.com/wissemhammoudi/booking_n8n
cd bookinh_n8N

# Start all services
docker-compose up -d
```

### 2. Access Services
- **N8N Workflow Editor**: http://localhost:5678 (admin/admin)
- **Booking Demo App**: http://localhost:3000
- **Database Admin**: http://localhost:5050 (admin@admin.com/admin)

### 3. Import Workflows
1. Open N8N at http://localhost:5678
2. Import the workflow images provided in the project:
   - `availnle time slot.json` - Available Time Slot Checker
   - `booking.json` - Booking Processor
3. Activate both workflows

### 4. Watch Demo
📹 **Demo Video**: `demo/demo.mp4` - Full system demonstration

## Architecture

```
Client Request → Webhook → Validation → Calendar Check → Response
                                                ↓
                                         Create Event → Email
```

### System Components
- **N8N**: Workflow automation engine
- **PostgreSQL**: Data persistence for workflows and executions
- **pgAdmin**: Database management interface
- **Demo Web App**: React/Next.js booking interface
- **Google Calendar**: Backend scheduling system

### Time Slots Configuration

The system operates with predefined time slots (Tunisia time, UTC+1):

- **Morning**: 9:30 AM, 10:30 AM, 11:30 AM
- **Afternoon**: 2:30 PM, 3:30 PM, 4:30 PM, 5:30 PM
- **Evening**: 8:30 PM

Each slot is 1 hour in duration.

## Workflows

### Workflow Images Reference

The system includes two main workflow images:

1. **`workflows/available_slot_worklfow.png`** - Available Time Slot Checker
   - Handles date availability queries
   - Returns available time slots

2. **`workflows/booking.png`** - Booking Processor
   - Processes booking requests
   - Creates calendar events
   - Sends confirmation emails

### 1. Available Time Slot Checker

**Endpoint**: `POST /webhook/check-booking-date`

#### Purpose
Checks calendar availability for a specific date and returns available time slots.

#### Node Flow

1. **Booking Webhook1** - Receives date requests via HTTP POST
2. **Configure Slots1** - Sets up available time slots and validates date format
3. **Check My Calendar1** - Queries Google Calendar for existing events
4. **Process Availability1** - Analyzes conflicts and determines available slots
5. **Send Response1** - Returns availability data

#### Request Format

```json
{
  "date": "2024-12-15"
}
```

If no date is provided, defaults to today's date.

#### Response Format

```json
{
  "success": true,
  "date": "2024-12-15",
  "dayName": "Sunday",
  "isWeekend": true,
  "isDayOff": false,
  "availableSlots": [
    {
      "time": "09:30",
      "display": "9:30 AM - 10:30 AM",
      "available": true,
      "reason": "Available"
    }
  ],
  "bookedSlots": [
    {
      "time": "14:30",
      "display": "2:30 PM - 3:30 PM",
      "available": false,
      "reason": "Client Meeting"
    }
  ],
  "message": "5 slots available"
}
```

#### Special Cases
- **Day Off**: Detects all-day "Day Off" events and returns no availability

---

### 2. Booking Processor

**Endpoint**: `POST /webhook/make-booking`

#### Purpose
Validates booking requests, checks availability, creates calendar events, and sends confirmation emails.

#### Node Flow

1. **Booking Webhook1** - Receives booking requests
2. **Validate Input1** - Validates required fields and formats
3. **Validation Check1** - Routes based on validation result
4. **Time Slot Check** - Verifies time slot is within allowed slots
5. **Time Valid Check** - Routes based on time slot validity
6. **Check My Calendar** - Queries calendar for conflicts
7. **Check Availability1** - Analyzes availability and holiday status
8. **Availability Check1** - Routes based on availability
9. **Create Calendar Event1** - Creates Google Calendar event
10. **Send a message** - Sends Gmail confirmation
11. **Prepare Success Response1** - Formats success response
12. **Success Response1** - Returns confirmation

#### Error Paths

- **Prepare Validation Error1** → **Validation Error Response**
- **Prepare Time Error1** → **Time Error Response1**
- **Prepare Availability Error1** → **Availability Error Response1**

#### Request Format

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+216 12 345 678",
  "date": "2024-12-15",
  "time": "10:30",
  "source": "Website"
}
```

#### Field Validation

| Field | Required | Format | Validation |
|-------|----------|--------|------------|
| name | Yes | String | Non-empty |
| email | Yes | String | Valid email format |
| phone | Yes | String | Min 8 digits with optional +, spaces, -, () |
| date | Yes | String | YYYY-MM-DD |
| time | Yes | String | HH:MM (must match allowed slots) |
| source | No | String | Default: "Website" |

#### Success Response

```json
{
  "success": true,
  "message": "Booking confirmed successfully!",
  "bookingDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+216 12 345 678",
    "date": "2024-12-15",
    "time": "10:30",
    "eventId": "abc123xyz",
    "eventLink": "https://calendar.google.com/..."
  },
  "confirmationMessage": "Hi John Doe, your booking is confirmed for 2024-12-15 at 10:30 (Tunisia time). You will receive a calendar invitation."
}
```

#### Error Responses

**Validation Error**
```json
{
  "success": false,
  "error": "Missing required fields: name, email",
  "message": "Booking validation failed"
}
```

**Invalid Time Slot**
```json
{
  "success": false,
  "error": "Invalid time slot. Available slots: 9:30 AM, 10:30 AM, ...",
  "message": "Invalid time slot",
  "availableSlots": "9:30 AM, 10:30 AM, 11:30 AM, 2:30 PM, 3:30 PM, 4:30 PM, 5:30 PM, 8:30 PM"
}
```

**Slot Not Available**
```json
{
  "success": false,
  "error": "This time slot is already booked. Please choose another time.",
  "message": "Time slot not available",
  "suggestion": "Please choose a different date or time"
}
```

## Demo

### Demo Application

A fully functional demo application is included and runs at **http://localhost:3000**

**Features:**
- Interactive date picker
- Real-time availability display
- Booking form with validation
- Responsive design

### Demo Video

📹 **`demo.mp4`** - Comprehensive system demonstration showing:
- Workflow setup and configuration
- Calendar integration
- Booking process from start to finish
- Email confirmation flow
- Error handling scenarios


## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Google Cloud Project with Calendar API enabled
- Gmail account for sending confirmations
- OAuth2 credentials for Google services

### 1. Google Cloud Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Calendar API
3. Enable Gmail API
4. Create OAuth2 credentials (Web application)
5. Add authorized redirect URIs: `http://localhost:5678/rest/oauth2-credential/callback`

### 2. N8N Credentials Configuration

#### Google Calendar OAuth2

1. Navigate to **Credentials** in N8N (http://localhost:5678)
2. Create new credential: **Google Calendar OAuth2 API**
3. Enter Client ID and Client Secret from Google Cloud
4. Complete OAuth flow

#### Gmail OAuth2

1. Create new credential: **Gmail OAuth2**
2. Enter Client ID and Client Secret
3. Complete OAuth flow

### 3. Import Workflows

1. Open N8N at http://localhost:5678
2. Go to **Workflows** → **Import from File**
3. Use the workflow  to recreate the workflows:

### 4. Configure Calendar Email

Update the calendar email in the following nodes:

**Available Time Slot Checker:**
- Node: `Check My Calendar1` → calendar property → value: `your-calendar@gmail.com`

**Booking Processor:**
- Node: `Check My Calendar` → calendar property → value: `your-calendar@gmail.com`
- Node: `Create Calendar Event1` → calendar property → value: `your-calendar@gmail.com`

### 5. Configure Email Template

Edit the **Send a message** node to customize the confirmation email:

```javascript
Subject: Confirmation de votre rendez-vous

Message:
Bonjour {{ $('Booking Webhook1').item.json.body.name }},

Nous vous confirmons que vous avez réservé un rendez-vous le 
{{ $('Booking Webhook1').item.json.body.date }} à 
{{ $('Booking Webhook1').item.json.body.time }}.

[Add additional details or instructions here]
```

### 6. Activate Workflows

1. Open each workflow in N8N
2. Click **Active** toggle in top-right
3. Verify webhook URLs are generated
4. Test with the demo app at http://localhost:3000

## Docker Deployment

### Services Overview

Your Docker Compose setup includes:

1. **PostgreSQL** (n8n-postgres:5432) - Database for N8N
2. **pgAdmin** (n8n-pgadmin:5050) - Database management
3. **Demo Web App** (booking-demo:3000) - Booking interface
4. **N8N** (n8n-dev:5678) - Workflow automation

### Deployment Commands

**Start all services:**
```bash
docker-compose up -d
```

**Stop all services:**
```bash
docker-compose down
```
**Check service status:**
```bash
docker-compose ps
```

### Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| N8N | http://localhost:5678 | admin/admin |
| Demo App | http://localhost:3000 | - |
| pgAdmin | http://localhost:5050 | admin@admin.com/admin |
| PostgreSQL | localhost:5432 | n8n/n8n |

### Database Management

1. Access pgAdmin at http://localhost:5050
2. Add new server:
   - **Name**: n8n-postgres
   - **Host**: postgres
   - **Port**: 5432
   - **Username**: n8n
   - **Password**: n8n

### Data Persistence

All data is persisted in Docker volumes:
- `postgres_data` - Database data
- `pgadmin_data` - pgAdmin configurations
- `n8n_data` - N8N workflows and credentials

## API Reference

### Check Available Slots

**Endpoint**: `POST /webhook/check-booking-date`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "date": "YYYY-MM-DD"  // Optional, defaults to today
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:5678/webhook/check-booking-date \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-12-15"}'
```

**Response Codes**:
- `200` - Success
- `400` - Invalid request format

---

### Create Booking

**Endpoint**: `POST /webhook/make-booking`

**Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "phone": "string (required, 8+ digits)",
  "date": "string (required, YYYY-MM-DD)",
  "time": "string (required, HH:MM)",
  "source": "string (optional)"
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:5678/webhook/make-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+21612345678",
    "date": "2024-12-15",
    "time": "10:30",
    "source": "Website"
  }'
```

**Response Codes**:
- `200` - Success or handled error
- All responses return JSON with `success` field
