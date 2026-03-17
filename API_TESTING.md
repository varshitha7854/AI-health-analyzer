# API Testing Guide

This guide shows how to test the backend API using curl commands and the built-in Swagger documentation.

## Quick Start

### 1. Start the Backend
```bash
cd backend
uvicorn main:app --reload
```

You should see:
```
Uvicorn running on http://127.0.0.1:8000
Press CTRL+C to quit
```

### 2. Access Swagger Documentation
Open in browser: **http://localhost:8000/docs**

This gives you an interactive UI to test all endpoints!

### 3. Run curl Commands Below
Or test with curl in your terminal.

---

## Testing Endpoints with curl

### Prerequisites
- Backend running on http://localhost:8000
- curl installed (usually built-in on Mac/Linux; built-in on Windows 10+)

**Note:** On Windows PowerShell, some curl syntax may need quotes. Examples use bash syntax.

---

## 1. User Authentication

### Create or Login a User
```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe"}'
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe"
}
```

**Note:** Save the `id` from the response - you'll use it for other requests.

### Test with Different Users
```bash
# Create user 2
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "jane_smith"}'

# Login again with same user (returns existing user)
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "john_doe"}'
```

---

## 2. Create Entries

### Create a Single Entry
Replace `user_id=1` with the user ID from above.

```bash
curl -X POST http://localhost:8000/entries?user_id=1 \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "mood": 4,
    "symptoms_text": "headache, fatigue",
    "notes_text": "Had a long day at work but feeling okay"
  }'
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "date": "2024-01-15",
  "mood": 4,
  "symptoms_text": "headache, fatigue",
  "notes_text": "Had a long day at work but feeling okay",
  "created_at": "2024-01-15T12:34:56.789012"
}
```

### Create Multiple Entries (for testing analysis)
You should create at least 5-10 entries for meaningful analysis.

```bash
# Today (mood 4)
curl -X POST http://localhost:8000/entries?user_id=1 \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-15", "mood": 4, "symptoms_text": "none", "notes_text": "Great day"}'

# Yesterday (mood 3)
curl -X POST http://localhost:8000/entries?user_id=1 \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-14", "mood": 3, "symptoms_text": "tired", "notes_text": "Okay day"}'

# 2 days ago (mood 2)
curl -X POST http://localhost:8000/entries?user_id=1 \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-13", "mood": 2, "symptoms_text": "headache, back pain", "notes_text": "Rough day"}'

# 3 days ago (mood 5)
curl -X POST http://localhost:8000/entries?user_id=1 \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-12", "mood": 5, "symptoms_text": "none", "notes_text": "Excellent day!"}'

# 4 days ago (mood 3)
curl -X POST http://localhost:8000/entries?user_id=1 \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-11", "mood": 3, "symptoms_text": "fatigue", "notes_text": "Normal day"}'
```

### Validate Mood Range (should fail with mood=6)
```bash
curl -X POST http://localhost:8000/entries?user_id=1 \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-15", "mood": 6, "symptoms_text": "none", "notes_text": "Bad mood"}'
```

**Response (error):**
```json
{
  "detail": "Mood must be between 1 and 5"
}
```

---

## 3. Get Entries

### Get All Entries for User
```bash
curl http://localhost:8000/entries?user_id=1
```

**Response:**
```json
[
  {
    "id": 5,
    "user_id": 1,
    "date": "2024-01-15",
    "mood": 4,
    "symptoms_text": "none",
    "notes_text": "Great day",
    "created_at": "..."
  },
  {
    "id": 4,
    "user_id": 1,
    "date": "2024-01-14",
    "mood": 3,
    ...
  }
]
```

### Get Limited Entries
```bash
# Get only 2 most recent entries
curl http://localhost:8000/entries?user_id=1&limit=2
```

### Get Entries for Different User
```bash
# If you created user 2
curl http://localhost:8000/entries?user_id=2
```

---

## 4. Statistics

### Get Stats Summary
```bash
curl http://localhost:8000/stats/summary?user_id=1
```

**Response:**
```json
{
  "total_entries": 5,
  "average_mood": 3.6,
  "entries_per_day": [
    {"date": "2024-01-11", "count": 1},
    {"date": "2024-01-12", "count": 1},
    {"date": "2024-01-13", "count": 1},
    {"date": "2024-01-14", "count": 1},
    {"date": "2024-01-15", "count": 1}
  ]
}
```

### Understanding Stats
- `total_entries`: How many entries exist
- `average_mood`: Mean of all mood values (scale 1-5)
- `entries_per_day`: Count of entries for each date (useful for charting)

---

## 5. AI Analysis

### Run Analysis (Last 30 Days)
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "days": 30}'
```

**Response (Mock Mode - no API key):**
```json
{
  "summary_text": "Over the past 5 entries, your mood averaged 3.6 out of 5. Your best mood day (2024-01-12) had a mood of 5. Your lowest mood day (2024-01-13) had a mood of 2. Most frequent symptoms: headache, fatigue.",
  "patterns": [
    {
      "title": "Common Symptoms",
      "description": "Frequent symptoms: headache, fatigue."
    }
  ]
}
```

### Run Analysis (Last 7 Days)
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "days": 7}'
```

### Run Analysis (Last 1 Day)
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "days": 1}'
```

---

## 6. Analysis History

### Get All Past Analyses
```bash
curl http://localhost:8000/analyses?user_id=1
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "summary_text": "Over the past 5 entries...",
    "patterns_json": [...],
    "generated_at": "2024-01-15T12:45:00.123456"
  }
]
```

---

## Testing Workflow

### Complete Test Sequence

**Step 1: Create a user**
```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test_user"}'
```
Note the user ID (let's say it's `1`)

**Step 2: Create 5+ entries**
```bash
# Create 5 entries with different moods and symptoms
for i in {1..5}; do
  curl -X POST http://localhost:8000/entries?user_id=1 \
    -H "Content-Type: application/json" \
    -d "{\"date\": \"2024-01-$((15-i))\", \"mood\": $((i)), \"symptoms_text\": \"test\", \"notes_text\": \"Entry $i\"}"
done
```

**Step 3: Get entries**
```bash
curl http://localhost:8000/entries?user_id=1
```

**Step 4: Get stats**
```bash
curl http://localhost:8000/stats/summary?user_id=1
```

**Step 5: Run analysis**
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "days": 30}'
```

**Step 6: Get past analyses**
```bash
curl http://localhost:8000/analyses?user_id=1
```

---

## Using Swagger UI (Easier!)

The easiest way to test is the interactive Swagger UI:

1. **Open** http://localhost:8000/docs
2. **Click** on an endpoint (e.g., "POST /login")
3. **Click** "Try it out"
4. **Fill in** the request body
5. **Click** "Execute"
6. See response immediately

### Try it:
- POST /login - Create user
- POST /entries - Create entry
- GET /entries - List entries
- GET /stats/summary - Get stats
- POST /analyze - Run analysis
- GET /analyses - View past analyses

---

## Common Issues

### "POST /login" Returns 422 Validation Error
- Check request body is valid JSON
- Username field is required
- Example: `{"username": "john"}`

### "User not found" on POST /entries
- Make sure user exists first (POST /login)
- Use same user_id in query parameter
- Example: `/entries?user_id=1` (1 = your user's ID)

### "Mood must be between 1 and 5"
- Don't send mood values outside 1-5
- Mood must be integer

### Empty analysis result (mock mode)
- This is normal if no GEMINI_API_KEY is set
- You'll get a mock summary instead
- To enable real AI, add API key to .env and restart

### "Connection refused" error
- Make sure backend is running: `uvicorn main:app --reload`
- Check it's running on http://localhost:8000
- Check firewall isn't blocking port 8000

---

## Saving Test Data

### Export entries as JSON
```bash
curl http://localhost:8000/entries?user_id=1 > entries.json
```

### Export stats
```bash
curl http://localhost:8000/stats/summary?user_id=1 > stats.json
```

---

## Advanced Testing

### Test with jq (JSON Pretty Print)
If you have jq installed:
```bash
curl http://localhost:8000/entries?user_id=1 | jq .
```

### Test with Python
```python
import requests

BASE_URL = "http://localhost:8000"

# Login
user = requests.post(f"{BASE_URL}/login", json={"username": "test"}).json()
print(f"User ID: {user['id']}")

# Create entry
entry = requests.post(
    f"{BASE_URL}/entries?user_id={user['id']}",
    json={"date": "2024-01-15", "mood": 4}
).json()
print(f"Entry ID: {entry['id']}")

# Get stats
stats = requests.get(f"{BASE_URL}/stats/summary?user_id={user['id']}").json()
print(f"Entries: {stats['total_entries']}, Avg Mood: {stats['average_mood']}")
```

### Test with Postman
1. Download Postman: https://www.postman.com/
2. Create new workspace
3. Create requests for each endpoint
4. Save as collection for reuse

---

## Debugging Backend Logs

While backend is running, watch console for:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     127.0.0.1:8000 "POST /login HTTP/1.1" 200 OK
INFO:     127.0.0.1:8000 "POST /entries HTTP/1.1" 200 OK
```

- 200 = Success
- 400 = Bad request (check your data)
- 404 = Not found (check user_id)
- 422 = Validation error (check types)
- 500 = Server error (check backend console)

---

## Full Example Script (Bash)

Save as `test_api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000"

echo "=== Testing Health & Mood API ==="

# Create user
echo -e "\n1. Creating user..."
USER=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test_user"}')
USER_ID=$(echo $USER | jq -r '.id')
echo "User ID: $USER_ID"

# Create entries
echo -e "\n2. Creating 3 entries..."
for mood in 3 4 5; do
  curl -s -X POST "$BASE_URL/entries?user_id=$USER_ID" \
    -H "Content-Type: application/json" \
    -d "{\"date\": \"2024-01-15\", \"mood\": $mood, \"symptoms_text\": \"test\", \"notes_text\": \"Entry with mood $mood\"}" > /dev/null
  echo "  Created entry with mood $mood"
done

# Get entries
echo -e "\n3. Getting all entries..."
curl -s "$BASE_URL/entries?user_id=$USER_ID" | jq '.[] | {date, mood, notes_text}'

# Get stats
echo -e "\n4. Getting stats..."
curl -s "$BASE_URL/stats/summary?user_id=$USER_ID" | jq .

# Analyze
echo -e "\n5. Running analysis..."
curl -s -X POST "$BASE_URL/analyze" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": $USER_ID, \"days\": 30}" | jq .

echo -e "\n✓ All tests complete!"
```

Run with:
```bash
chmod +x test_api.sh
./test_api.sh
```

---

## Checklist for Successful Setup

- [ ] Backend running: `uvicorn main:app --reload`
- [ ] PostgreSQL database created: `health_mood_db`
- [ ] .env file has correct DATABASE_URL
- [ ] Can access Swagger docs: http://localhost:8000/docs
- [ ] Can create user with POST /login
- [ ] Can create entry with POST /entries
- [ ] Can get stats with GET /stats/summary
- [ ] Can analyze with POST /analyze
- [ ] Mock analysis works (no API key needed)
- [ ] (Optional) Real analysis works (with GEMINI_API_KEY)

---

## Next Steps

- Run the frontend: `npm run dev` in frontend folder
- Test in browser at http://localhost:5173
- Create entries through UI
- Verify data appears in API
- Test analysis feature
- Review code in backend/README.md and frontend/README.md

Good luck! 🎉
