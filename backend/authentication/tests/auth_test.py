"""Module to provide simple http test."""

import random
from typing import Any

from faker import Faker
from fastapi import FastAPI
from fastapi.testclient import TestClient
from placy.controllers.auth import AuthController
from placy.services.config import Config
from placy.services.databases.auth_repository import AuthRepository
from placy.services.databases.otp_repository import OTPRepository
from placy.services.email import EmailService
from placy.services.logging import DefaultLogger

from placy.placy import Placy


class MockEmailService(EmailService):
    """Mock sending emails."""

    def __init__(self, config: Config):
        """Construct the Mock Emailer."""
        super().__init__(config)
        self.cache = dict()

    def send_email(self, email: str, otp: str):
        """Send a fake email."""
        self.cache[email] = otp


app = FastAPI()
# Testing config
env = {
    "SECRET_KEY": "someusefulpassword",
    "MONGO_URI": "mongodb://localhost:27017",
    "SENDGRID_API_KEY": "somethingfake",
}
config = Config(mongo_uri=env["MONGO_URI"], sendgrid_api_key=env["SENDGRID_API_KEY"])
logger = DefaultLogger(config)
auth_repo = AuthRepository(logger, config)
otp_repo = OTPRepository(logger, auth_repo, config)
email = MockEmailService(config)
authController = AuthController(
    auth_repo=auth_repo,
    otp_repo=otp_repo,
    config=config,
    emailService=email,
    logging=logger,
)
placy = Placy(
    otpRepo=otp_repo,
    app=app,
    authRepo=auth_repo,
    loggingService=logger,
    config=config,
    authController=authController,
    emailService=email,
)
placy.setup()
placy.routes()
client = TestClient(app)


def assertSignUp(user: dict[str, str]):
    """Assert signup is working and possible."""
    response = client.post("/auth/signup", json=user)
    assert response.status_code == 200, "Status code not 200."
    assert response.json()["success"], response.json()


def assertLogin(user: dict[str, str]) -> str:
    """Assert login is working and possible."""
    response = client.post("/auth/login", json=user)
    assert response.status_code == 200, "Status code not 200."

    json_response = response.json()

    assert json_response["success"], "Request not a success."
    assert json_response["token"], "Token empty"
    assert json_response["refresh"], "Refresh Token empty."
    return json_response["token"]


def test_health():
    """Simple function for testing health of API."""
    response = client.get("/health")
    assert response.status_code == 200, "Status code not 200"
    assert response.json() == {"status": "OK", "version": 0.1}


def test_signup():
    """Test user signup functionality."""
    user = generate_user()
    assertSignUp(user)


def test_login():
    """Test user login functionality."""
    user = generate_user()
    assertSignUp(user)
    assertLogin(user)


def test_wrong_password():
    """Test user with wrong password."""
    user = generate_user()
    assertSignUp(user)
    assertLogin(user)

    # Make a wrong password
    user["password"] = "wrongpassword"

    response = client.post("/auth/login", json=user)
    assert response.status_code == 400, "Status code not 400."
    json_response = response.json()
    assert not json_response["success"], json_response["errmsg"]
    assert "token" not in json_response, "Token present"


def test_token_refresh():
    """Test token refresh endpoint."""
    user = generate_user()

    assertSignUp(user)

    token = assertLogin(user)

    response = client.get(
        "/auth/refresh",
        headers={"Authorization": f"Bearer {token}"},
    )

    json_response = response.json()

    assert json_response["success"], json_response["errmsg"]
    assert response.status_code == 200, "Response not a success"
    assert json_response["token"], "Token empty"
    assert json_response["refresh"], "Refresh token empty"


def test_wrong_token_refresh():
    """Test token refresh endpoint."""
    user = generate_user()

    assertSignUp(user)

    _ = assertLogin(user)

    response = client.get(
        "/auth/refresh",
        headers={"Authorization": f"Bearer bitchplease"},
    )

    json_response = response.json()
    assert response.status_code != 200, json_response["errmsg"]
    assert not json_response["success"], "Token was parsed."
    assert "token" not in json_response, "Token present."
    assert "refresh" not in json_response, "Refresh token present."


def test_reset_password():
    """Test the forgot/reset password flow."""
    user = generate_user()

    assertSignUp(user)

    _ = assertLogin(user)

    response = client.post("/auth/forgot?" + f"email={user['email']}")

    json_response = response.json()
    assert json_response["success"], json_response
    assert response.status_code == 200, "Response not a success"

    otp = email.cache[user["email"]]

    new_pass = "something_new"
    update_password = {"email": user["email"], "otp": otp, "new_password": new_pass}
    response = client.post("/auth/reset", json=update_password)

    assert json_response["success"], json_response["errmsg"]
    assert response.status_code == 204, "Response not a success"

    user["password"] = "something_new"

    assertLogin(user)


def generate_user() -> dict[str, str]:
    """Generate a fake user for testing."""
    faker = Faker()
    user_payload = {
        "email": faker.email(),
        "password": faker.password(),
        "username": faker.user_name(),
        "role": "user",
    }

    return user_payload
