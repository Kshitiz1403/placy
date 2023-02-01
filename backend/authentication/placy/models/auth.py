"""Module contains models for authentication."""

import datetime

from pydantic import BaseModel, EmailStr, Field

roles = ("user", "officer", "moderator", "admin")


class PasswordUpdate(BaseModel):
    """Model for updated password."""

    email: EmailStr
    otp: str = Field(max_length=6, min_length=6)
    new_password: str


class Auth(BaseModel):
    """Model for the user."""

    username: str
    email: EmailStr
    password: str
    userId: str | None
    role: str | None
