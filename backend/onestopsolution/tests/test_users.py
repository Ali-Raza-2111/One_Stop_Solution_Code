from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_and_get_user():
    response = client.post("/users/", json={"name": "Ali", "email": "ali@test.com"})
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "ali@test.com"

    get_resp = client.get(f"/users/{data['id']}")
    assert get_resp.status_code == 200
