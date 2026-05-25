# StreakForge

StreakForge is a Streamlit productivity app for tracking daily habits, events,
notes, streaks, and personal execution.

## Features

- Login and sign up with local password hashing
- Persistent per-user data using SQLite
- Daily Forge habit tracker
- Event Board with deadlines and backlog events
- Field Notes
- Streak stats
- Add, edit, and delete controls for Forge and Event Board
- List editing lock after 10:00 PM

## Run Locally

```powershell
pip install -r requirements.txt
streamlit run app.py
```

By default, the app stores account and user productivity data in local SQLite at
`streakforge.db`, which is ignored by Git because it can contain private user
information.

## Supabase / Postgres

For cross-device sync, set one of these secrets/environment variables to your
Supabase Postgres connection string:

```text
SUPABASE_DB_URL="postgresql://..."
```

or:

```text
DATABASE_URL="postgresql://..."
```

When that value is present, StreakForge uses Supabase/Postgres instead of the
local SQLite file.

For persistent login cookies, optionally add a long random secret:

```text
AUTH_COOKIE_SECRET="use-a-long-random-string-here"
```
