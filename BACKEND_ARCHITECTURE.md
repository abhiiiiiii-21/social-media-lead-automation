# BACKEND_ARCHITECTURE.md

# Social Media Lead Automation - Backend Architecture

## Overview

This document defines the architecture, coding standards, backend rules, and development guidelines for the Social Media Lead Automation backend.

The backend must follow these rules throughout development. Do not change the architecture unless explicitly instructed.

---

# Tech Stack

Framework
- FastAPI

Language
- Python 3.12+

Database
- SQLite (Development)
- PostgreSQL (Future Production)

ORM
- SQLAlchemy 2.0

Database Migrations
- Alembic

Validation
- Pydantic V2

Automation
- Playwright

AI
- Groq API

Environment
- Python Dotenv

Logging
- Loguru

Server
- Uvicorn

CSV Processing
- Pandas

---

# Development Philosophy

The backend should be:

- Modular
- Scalable
- Easy to maintain
- Fully typed
- Service-based architecture
- Async-first
- Production ready
- Easily replaceable with cloud deployment later

---

# Folder Structure

backend/

app/
├── api/
├── automation/
├── core/
├── database/
├── models/
├── schemas/
├── services/
├── websocket/
├── utils/
├── templates/
└── main.py

storage/
├── uploads/
├── exports/
└── logs/

alembic/

.env

requirements.txt

README.md

---

# Coding Standards

Always use Type Hints.

Use Async functions wherever possible.

Business logic must never exist inside API routes.

API routes should only:

- Validate Request
- Call Service
- Return Response

Never duplicate business logic.

Keep every service focused on one responsibility.

Follow SOLID Principles.

---

# Database Rules

Use SQLAlchemy ORM.

Use UUID Primary Keys.

Use Alembic for migrations.

Avoid raw SQL unless absolutely necessary.

Separate Models from Schemas.

Every table must include:

- id
- created_at
- updated_at

---

# API Rules

Follow REST API conventions.

Use consistent endpoint naming.

Example:

GET /campaigns

POST /campaigns

PATCH /campaigns/{id}

DELETE /campaigns/{id}

Never return inconsistent JSON.

Every response should follow a standard structure.

---

# Service Layer Rules

Every major feature should have its own service.

Example

CampaignService

LeadService

TemplateService

QueueService

AIService

ScraperService

SettingsService

LoggingService

Never put business logic inside routes.

---

# Automation Rules

Automation code should remain isolated.

Everything related to Playwright belongs inside:

automation/

No frontend logic inside automation.

Automation should never directly access API routes.

Automation must communicate through Services.

---

# Playwright Rules

Launch browser only when required.

Reuse browser sessions.

Store login sessions locally.

Never hardcode delays.

Always use explicit waits.

Handle retries gracefully.

Keep selectors centralized.

Avoid duplicated scraping logic.

---

# AI (Groq) Rules

Minimize API usage.

Never call Groq twice for the same lead.

Cache every AI response.

Cache website analysis.

Skip already analyzed websites.

Use Python for deterministic tasks.

Use AI only for:

- Website analysis
- Sales recommendations
- Personalized insights
- Lead qualification

Never use AI for:

- Parsing CSV
- Website existence
- Instagram metadata
- Filtering logic

Rotate multiple Groq API Keys automatically.

Store AI Usage Logs.

Store Prompt Versions.

---

# AI Cache Rules

Before calling Groq:

Check Database

↓

Already Analyzed?

YES

Return Cached Result

NO

Call Groq

Store Result

Return Result

---

# Queue Rules

Campaign

↓

Lead Collection

↓

Lead Qualification

↓

Queue

↓

Sending

↓

Completed

Every Queue Item must contain:

Status

Retries

Timestamp

Logs

---

# Logging Rules

Every important event should be logged.

Campaign Created

Campaign Started

Scraping Started

Lead Qualified

Queue Created

Message Sent

Message Failed

Campaign Completed

Errors

Logs should be stored in both:

Database

Local log files

---

# Error Handling

Never crash the server.

Use proper exception handling.

Return meaningful error messages.

Log every unexpected exception.

Retry temporary failures.

Fail gracefully.

---

# Security Rules

Never expose API Keys.

Store secrets inside .env.

Validate every upload.

Validate every request.

Never trust frontend input.

Sanitize filenames.

Restrict CORS appropriately.

---

# Performance Rules

Cache expensive operations.

Avoid duplicate database queries.

Avoid duplicate AI calls.

Avoid duplicate website analysis.

Batch expensive operations.

Keep API responses fast.

Never block the event loop.

---

# Mock Data Rules

Mock data should exist only during development.

Keep mock files isolated.

No production endpoint should depend on mock data.

---

# File Upload Rules

Support CSV Uploads.

Validate file extension.

Validate file size.

Reject invalid files.

Store uploads inside storage/uploads.

---

# WebSocket Rules

WebSockets should only handle:

Campaign Progress

Execution Logs

Queue Updates

Live Status

Do not put business logic inside WebSockets.

---

# Settings Rules

Store all configurable values inside the database.

Examples:

Groq API Keys

Default Model

Temperature

Max Tokens

Retry Limits

Automation Delays

Never hardcode configurable values.

---

# Dependency Rules

Only install dependencies when required.

Avoid unnecessary packages.

Reuse existing libraries.

Keep package count minimal.

---

# Code Quality

No duplicated code.

No unused imports.

No unused variables.

No console debugging.

No TODO comments.

No dead code.

No abandoned components.

---

# Future Scalability

Backend should be designed so it can later support:

PostgreSQL

Redis

Docker

Background Workers

Celery

Cloud Deployment

Multiple Automation Workers

Without major architectural changes.

---

# Definition of Done

A backend feature is complete only if:

✓ Fully Typed

✓ Uses Services

✓ Handles Errors

✓ Logged Properly

✓ Uses Database Correctly

✓ Production Build Passes

✓ No Lint Issues

✓ No Dead Code

✓ Documentation Updated

✓ Tested Locally

---

# Important Rule

Do NOT change the architecture.

Do NOT rename folders.

Do NOT rename APIs.

Do NOT move files unnecessarily.

Do NOT introduce unnecessary dependencies.

Always extend the existing architecture instead of replacing it.

This document is the single source of truth for backend development.