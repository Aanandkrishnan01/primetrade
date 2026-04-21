import requests
import json

url = "http://localhost:8000/api/v1/auth/register"
payload = {
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "full_name": "Test User"
}

response = requests.post(url, json=payload)
print(f"Status: {response.status_code}")
print(f"Body: {response.text}")
