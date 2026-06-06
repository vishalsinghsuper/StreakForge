from pydantic import BaseModel, EmailStr, Field
from typing import Any


class UserPublic(BaseModel):
    username: str
    display_name: str
    email: EmailStr


class SignupRequest(BaseModel):
    username: str = Field(min_length=3, max_length=20, pattern=r"^[a-z0-9_]+$")
    display_name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=200)


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


class Habit(BaseModel):
    id: int
    text: str
    pillar: str = "General"
    done: bool = False
    created_after_edit_cutoff: bool = False


class Event(BaseModel):
    id: int
    text: str
    deadline: str | None = None
    done: bool = False
    done_date: str | None = None
    created_after_edit_cutoff: bool = False


class Note(BaseModel):
    title: str = ""
    content: str = ""
    date: str


class StreakStats(BaseModel):
    current: int = 0
    prev: int = 0
    best: int = 0


class AppState(BaseModel):
    habits: list[Habit] = []
    active_pillar: str = "General"
    stats_master: StreakStats = StreakStats()
    stats_iron: StreakStats = StreakStats()
    stats_mind: StreakStats = StreakStats()
    stats_general: StreakStats = StreakStats()
    events: list[Event] = []
    history: list[Event] = []
    notes_list: list[Note] = []


class StatePatch(BaseModel):
    data: dict[str, Any]


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=200)
