# N8N Booking System Documentation

A comprehensive booking system built with N8N that integrates with Google Calendar to manage appointment scheduling with automatic availability checking and email confirmations.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Workflows](#workflows)
  - [Available Time Slot Checker](#1-available-time-slot-checker)
  - [Booking Processor](#2-booking-processor)
- [Setup Instructions](#setup-instructions)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Error Handling](#error-handling)

## Overview

This booking system consists of two interconnected N8N workflows that handle appointment scheduling:

1. **Available Time Slot Checker** - Queries calendar availability for a specific date
2. **Booking Processor** - Validates and creates new bookings with calendar integration

The system uses Google Calendar as the backend and provides REST API endpoints for integration with websites or applications.

## Features

- ✅ Real-time calendar availability checking
- ✅ Automated booking validation
- ✅ Google Calendar integration
- ✅ Email confirmation notifications
- ✅ Weekend and holiday detection
- ✅ Time slot conflict prevention
- ✅ Timezone support (Tunisia/CET)
- ✅ CORS-enabled API endpoints

## Architecture

```
Client Request → Webhook → Validation → Calendar Check → Response
                                                ↓
                                         Create Event → Email
```

### Time Slots Configuration

The system operates with predefined time slots (Tunisia time, UTC+1):

- **Morning**: 9:30 AM, 10:30 AM, 11:30 AM
- **Afternoon**: 2:30 PM, 3:30 PM, 4:30 PM, 5:30 PM
- **Evening**: 8:30 PM

Each slot is 1 hour in duration.

## Workflows

### 1. Available Time Slot Checker

**Workflow ID**: `Z5UIe7N2pZib2Rz8`  
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

- **Weekends**: Returns empty slots with message "Weekend - No appointments available"
- **Day Off**: Detects all-day "Day Off" events and returns no availability
- **Holidays**: Detected via all-day calendar events

---

### 2. Booking Processor

**Workflow ID**: `v5m7m6TN5a5j5nli`  
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

**Holiday/Closed**
```json
{
  "success": false,
  "error": "Sorry, we are closed on this date: National Holiday",
  "message": "Time slot not available",
  "suggestion": "Please choose a different date or time"
}
```

## Setup Instructions

### Prerequisites

- N8N instance (self-hosted or cloud)
- Google Cloud Project with Calendar API enabled
- Gmail account for sending confirmations
- OAuth2 credentials for Google services

### 1. Google Cloud Setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Calendar API
3. Enable Gmail API
4. Create OAuth2 credentials (Web application)
5. Add authorized redirect URIs for N8N

### 2. N8N Credentials Configuration

#### Google Calendar OAuth2

1. Navigate to **Credentials** in N8N
2. Create new credential: **Google Calendar OAuth2 API**
3. Enter Client ID and Client Secret from Google Cloud
4. Complete OAuth flow
5. Note the credential ID: `k15oBfSIXYGKWMfT`

#### Gmail OAuth2

1. Create new credential: **Gmail OAuth2**
2. Enter Client ID and Client Secret
3. Complete OAuth flow
4. Note the credential ID: `wsm0EIKduuY7zppf`

### 3. Import Workflows

1. Copy the workflow JSON from the provided files
2. In N8N, go to **Workflows** → **Import from File/URL**
3. Paste the JSON content
4. Click **Import**
5. Repeat for both workflows

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

1. Open each workflow
2. Click **Active** toggle in top-right
3. Verify webhook URLs are generated

### 7. Test the System

```bash
# Test availability check
curl -X POST https://your-n8n-instance.com/webhook/check-booking-date \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-12-15"}'

# Test booking creation
curl -X POST https://your-n8n-instance.com/webhook/make-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+216 12 345 678",
    "date": "2024-12-15",
    "time": "10:30",
    "source": "Website"
  }'
```

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

**Response Codes**:
- `200` - Success or handled error
- All responses return JSON with `success` field

## Configuration

### Modifying Time Slots

To change available time slots, edit the **Configure Slots1** node in the availability checker:

```json
[
  {"time": "09:30", "display": "9:30 AM - 10:30 AM"},
  {"time": "10:30", "display": "10:30 AM - 11:30 AM"},
  // Add or modify slots
]
```

Also update the allowed slots array in the **Time Slot Check** node of the booking processor.

### Timezone Configuration

The system uses Tunisia time (UTC+1). Datetime strings include timezone:

```javascript
const startDateTime = `${date}T${time}:00+01:00`;
```

To change timezone, update the offset in:
- **Time Slot Check** node (both workflows)
- **Check Availability1** node

### Holiday Detection

The system detects holidays through all-day calendar events with keywords:
- "holiday"
- "off"
- "vacation"
- "closed"
- "day off"

Add these events to your Google Calendar to block dates.

 ## Error Handling

### Validation Errors

The system validates:
- Required fields presence
- Email format
- Phone number format
- Date format (YYYY-MM-DD)
- Time format (HH:MM)
- Time slot validity

### Calendar Errors

- Google Calendar API failures return error responses
- `alwaysOutputData: true` ensures workflow continues even if calendar is empty

### Error Response Structure

All errors follow this format:

```json
{
  "success": false,
  "error": "Error description",
  "message": "User-friendly message"
}
```

