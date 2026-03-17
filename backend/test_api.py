import requests
import json

BASE_URL = 'http://localhost:8000'

# Test 1: Create user
print('=== Test 1: Create User ===')
user_data = {'username': 'varshitha'}
response = requests.post(f'{BASE_URL}/users/', json=user_data)
print(f'Status: {response.status_code}')
print(f'Response: {json.dumps(response.json(), indent=2, default=str)}')
print()

# Test 2: Add entry
print('=== Test 2: Add Entry ===')
entry_data = {
    'date': '2026-03-17',
    'mood_score': 7,
    'energy': 6,
    'notes': 'Felt better after fixing backend.'
}
response = requests.post(f'{BASE_URL}/entries/', json=entry_data, params={'username': 'varshitha'})
print(f'Status: {response.status_code}')
print(f'Response Text: {response.text}')
try:
    print(f'Response: {json.dumps(response.json(), indent=2, default=str)}')
except:
    print(f'Failed to parse JSON response')
print()

# Test 3: Get stats
print('=== Test 3: Get Stats ===')
response = requests.get(f'{BASE_URL}/stats/varshitha')
print(f'Status: {response.status_code}')
print(f'Response: {json.dumps(response.json(), indent=2, default=str)}')
print()

# Test 4: Get entries
print('=== Test 4: Get Entries ===')
response = requests.get(f'{BASE_URL}/entries/varshitha')
print(f'Status: {response.status_code}')
print(f'Response: {json.dumps(response.json(), indent=2, default=str)}')
print()

# Test 5: Get entry count
print('=== Test 5: Get Entry Count ===')
response = requests.get(f'{BASE_URL}/count/varshitha')
print(f'Status: {response.status_code}')
print(f'Response: {json.dumps(response.json(), indent=2, default=str)}')
