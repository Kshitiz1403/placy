"""Configure routes for authentication."""

from fastapi import BackgroundTasks, FastAPI, Header, Response
from placy.controllers.auth import AuthController
from placy.models.auth import Auth, PasswordUpdate
from placy.models.response import AuthResponse, ErrorResponse, JWTRefreshResponse
from pydantic import EmailStr


def setupAuthRoutes(app: FastAPI, controller: AuthController) -> None:
    """Configure routes for authentication."""

    @app.post(
        "/auth/signup",
        response_model=AuthResponse | ErrorResponse,
        response_model_exclude_none=True,
        response_description="Allow user signup.",
    )
    def signup(auth: Auth, temp: Response):
        response = controller.signup(auth)
        temp.status_code = response.status
        return response

    @app.post(
        "/auth/login",
        response_model=AuthResponse | ErrorResponse,
        response_model_exclude_none=True,
        response_description="Allows user logins.",
    )
    def login(auth: Auth, temp: Response):
        response = controller.login(auth)
        temp.status_code = response.status
        return response

    @app.get(
        "/auth/refresh",
        response_model=JWTRefreshResponse | ErrorResponse,
        response_description="Allows refreshing JWT token.",
    )
    def refresh(temp: Response, authorization: str | None = Header(default=None)):
        response = controller.refresh(authorization)
        temp.status_code = response.status
        return response

    @app.post(
        "/auth/forgot",
        response_model=ErrorResponse,
        response_description="Allows user to request forgot password.",
    )
    def forgot(email: EmailStr, temp: Response, background_task: BackgroundTasks):
        response = controller.forgot(email, background_task)
        temp.status_code = response.status
        return response

    @app.post(
        "/auth/reset",
        response_model=ErrorResponse,
        response_description="Resets the given user's password if OTP is valid.",
    )
    def reset(update: PasswordUpdate, temp: Response):
        response = controller.reset(update)
        temp.status_code = response.status
        return response
