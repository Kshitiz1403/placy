"""Module has controllers for Authentication."""

import random
from collections import namedtuple
from datetime import datetime
from http import HTTPStatus
from typing import Any, Tuple

import jwt
from fastapi import BackgroundTasks
from mongoengine.fields import dateutil
from passlib.hash import pbkdf2_sha256
from placy.models.auth import Auth, PasswordUpdate
from placy.models.auth_orm import OTP, User
from placy.models.response import (
    AuthResponse,
    ErrorResponse,
    Health,
    JWTRefreshResponse,
)
from placy.services.config import Config
from placy.services.databases.auth_repository import AuthRepository
from placy.services.databases.otp_repository import OTPRepository
from placy.services.email import EmailService
from placy.services.logging import LoggingService
from pydantic import EmailStr

TokenResponse = namedtuple("TokenResponse", ["confirmed", "error"])


class AuthController:
    """Router handles all routing."""

    def __init__(
        self,
        auth_repo: AuthRepository,
        otp_repo: OTPRepository,
        config: Config,
        emailService: EmailService,
        logging: LoggingService,
    ):
        """Construct the Router class."""
        self.auth_repo = auth_repo
        self.otp_repo = otp_repo
        self.config = config
        self.email = emailService
        self.logger = logging

    def generate_hash(self, password: str) -> str:
        """Generate a hash and the salt to store."""
        hash = pbkdf2_sha256.hash(password)
        self.logger.log_info("Password hash generated.")
        return hash

    def comparePasswords(self, hashedPass: str, givenPass: str) -> bool:
        """Compare passwords."""
        return pbkdf2_sha256.verify(givenPass, hashedPass)

    def generate_otp(self, email: str) -> OTP:
        """Generate a OTP instance."""
        otp = "".join([str(random.randint(0, 9)) for _ in range(6)])
        self.logger.log_info("Generated a OTP.")

        exp = datetime.now() + self.config.otp_expiry

        instance = OTP(email=EmailStr(email), otp=otp, exp=exp)
        self.logger.log_info("Generated a OTP instance.")

        return instance

    def reset(self, update: PasswordUpdate) -> ErrorResponse:
        """Route to handle reset password requests."""
        otp = self.otp_repo.search_otp(update.email)

        self.logger.log_info(f"Searched for a otp belonging to: {update.email}")

        if otp == None:
            self.logger.log_info(f"OTP not found for user: {update.email}")
            return ErrorResponse(
                status=HTTPStatus.BAD_REQUEST, success=False, errmsg="OTP not found."
            )

        now = datetime.now()
        exp = dateutil.parser.parse(str(otp.exp))

        if exp < now:
            self.logger.log_info(f"OTP for user: {update.email}, hash expired.")
            return ErrorResponse(
                status=HTTPStatus.BAD_REQUEST, success=False, errmsg="OTP has expired."
            )

        self.logger.log_info(f"OTP for user: {update.email} is valid!")
        hash = self.generate_hash(update.new_password)

        self.logger.log_info(f"Updating user password for: {update.email}")
        result = self.auth_repo.update_user_password(email=update.email, password=hash)

        if result.status != HTTPStatus.OK:
            self.logger.log_error(
                f"Error while updating user password for user: {update.email}"
            )
            return ErrorResponse(
                status=result.status, errmsg=result.errmsg, success=False
            )

        self.logger.log_info(
            f"Password for user: {update.email}, was updated successfully!"
        )
        return ErrorResponse(status=result.status, errmsg="", success=True)

    def forgot(self, email: EmailStr, background: BackgroundTasks) -> ErrorResponse:
        """Route to handle forgot password requests."""
        otp = self.generate_otp(email)
        self.logger.log_info(f"Generated a OTP for user {email}")

        (id, errmsg, status_code) = self.otp_repo.add_otp(otp)

        if id == "":
            self.logger.log_error("Error adding OTP to the database.")
            return ErrorResponse(success=False, errmsg=errmsg, status=status_code)

        self.logger.log_info("Starting background task for sending email.")
        background.add_task(self.email.send_email, email, str(otp.otp))

        return ErrorResponse(success=True, errmsg="null", status=HTTPStatus.OK)

    def checkhealth(self, status: str):
        """Route to handle health request."""
        self.logger.log_info("Server is online!!")
        return Health(status="OK", version=0.1)

    def refresh(self, token_header: str | None) -> ErrorResponse | JWTRefreshResponse:
        """Route to handle JWT Token refresh."""
        if token_header == None:
            self.logger.log_warning("Request did not have JWT token.")
            return ErrorResponse(
                status=HTTPStatus.UNAUTHORIZED,
                success=False,
                errmsg="No authorization header.",
            )
        self.logger.log_info("Request had JWT token.")

        (auth, error) = self.decodeToken(token_header=token_header)

        self.logger.log_info("JWT token decoded.")

        if not auth and error:
            self.logger.log_error("Error decoding JWT token.")
            return error

        (new_token, refresh_token) = self.generate_token(auth)
        self.logger.log_error("New JWT token pair generated.")

        return JWTRefreshResponse(
            status=HTTPStatus.OK,
            success=True,
            token=new_token,
            refresh=refresh_token,
            errmsg="",
        )

    def signup(self, auth: Auth) -> AuthResponse | ErrorResponse:
        """Route to handle user signup."""
        hash_password = self.generate_hash(auth.password)

        user = User(
            email=auth.email,
            username=auth.username,
            password=hash_password,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        db_response = self.auth_repo.add_user(user)

        if (
            db_response.status != HTTPStatus.OK
            and db_response.status != HTTPStatus.CREATED
        ):
            return ErrorResponse(
                status=db_response.status,
                success=False,
                errmsg=db_response.errmsg,
            )
        # auth.password = ""

        # return AuthResponse(
        #     status=db_response.status,
        #     success=True,
        #     error=None,
        #     payload=auth,
        #     token=None,
        #     refresh=None,
        # )
        response = self.login(auth)
        if isinstance(response, AuthResponse):
            response.payload.password = ""
        return response

    def login(self, auth: Auth) -> AuthResponse | ErrorResponse:
        """Route to handle user signin."""
        foundUser = self.auth_repo.search_user(auth.email)

        if foundUser == None:
            return ErrorResponse(
                success=False, errmsg="User not found", status=HTTPStatus.NOT_FOUND
            )

        if not self.comparePasswords(
            hashedPass=str(foundUser.password), givenPass=auth.password
        ):
            return ErrorResponse(
                status=400, errmsg="email/password wrong", success=False
            )

        (token, refresh) = self.generate_token(auth.dict(exclude={"password"}))

        if token == "":
            return ErrorResponse(
                status=HTTPStatus.INTERNAL_SERVER_ERROR,
                success=False,
                errmsg="Can't generate token. SECRET_KEY empty.",
            )

        return AuthResponse(
            status=HTTPStatus.OK,
            success=True,
            error=None,
            payload=auth,
            token=token,
            refresh=refresh,
        )

    def generate_token(self, payload: dict[str, Any]) -> Tuple[str, str]:
        """Generate a pair of JWT Token."""
        payload["exp"] = datetime.now() + self.config.token_expiry

        key = self.config.secret_key

        token = jwt.encode(
            payload=payload, key=key, algorithm=self.config.jwt_algorithm
        )

        payload["exp"] = datetime.now() + self.config.refresh_expiry

        refresh = jwt.encode(
            payload=payload, key=key, algorithm=self.config.jwt_algorithm
        )

        return (token, refresh)

    def decodeToken(self, token_header: str) -> TokenResponse:
        """Decode the JWT token and return the body."""
        token = token_header.split()[1]
        decoded = None

        try:
            decoded = jwt.decode(
                token, self.config.secret_key, algorithms=self.config.jwt_algorithms
            )
        except jwt.ExpiredSignatureError:
            return TokenResponse(
                confirmed=False,
                error=ErrorResponse(
                    success=False,
                    errmsg="JWT token has expired",
                    status=HTTPStatus.UNAUTHORIZED,
                ),
            )
        except Exception as e:
            return TokenResponse(
                confirmed=False,
                error=ErrorResponse(
                    success=False,
                    errmsg=str(e),
                    status=HTTPStatus.INTERNAL_SERVER_ERROR,
                ),
            )

        return TokenResponse(confirmed=decoded, error=None)
