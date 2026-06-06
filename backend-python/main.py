from contextlib import asynccontextmanager

# pyrefly: ignore [missing-import]
from fastapi import Depends, FastAPI, Header, HTTPException, Response, status
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

from . import database
from .schemas import AppState, AuthResponse, LoginRequest, SignupRequest, StatePatch, UserPublic
from .security import hash_password, make_token, verify_password, verify_token
from .settings import get_settings
from .state import clean_state, default_state, process_midnight


settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    database.ensure_database_ready()
    yield


app = FastAPI(title="StreakForge API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def public_user(user: dict[str, str]) -> UserPublic:
    return UserPublic(username=user["username"], display_name=user["display_name"], email=user["email"])


def require_user(authorization: str | None = Header(default=None)) -> dict[str, str]:
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
    username = verify_token(token)
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
    user = database.get_user(username)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User no longer exists.")
    return user


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest) -> AuthResponse:
    database.ensure_database_ready()
    username = payload.username.strip().lower()
    email = str(payload.email).strip().lower()
    if database.get_user(username):
        raise HTTPException(status_code=409, detail="That username is already taken.")
    if database.email_exists(email):
        raise HTTPException(status_code=409, detail="An account already exists with that email.")

    user = database.create_user(username, payload.display_name.strip(), email, hash_password(payload.password))
    database.save_user_state(username, default_state())
    return AuthResponse(token=make_token(username), user=public_user(user))


@app.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    database.ensure_database_ready()
    username = payload.username.strip().lower()
    user = database.get_user(username)
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password.")
    return AuthResponse(token=make_token(username), user=public_user(user))


@app.get("/me", response_model=UserPublic)
def me(user: dict[str, str] = Depends(require_user)) -> UserPublic:
    return public_user(user)


@app.get("/state", response_model=AppState)
def get_state(user: dict[str, str] = Depends(require_user)) -> AppState:
    data = database.load_user_state(user["username"])
    state = clean_state(data)
    if data is None:
        database.save_user_state(user["username"], state)
    return AppState.model_validate(state)


@app.put("/state", response_model=AppState)
def put_state(payload: StatePatch, user: dict[str, str] = Depends(require_user)) -> AppState:
    state = clean_state(payload.data)
    database.save_user_state(user["username"], state)
    return AppState.model_validate(state)


@app.post("/state/midnight", response_model=AppState)
def midnight_reset(user: dict[str, str] = Depends(require_user)) -> AppState:
    state = clean_state(database.load_user_state(user["username"]))
    state = process_midnight(state)
    database.save_user_state(user["username"], state)
    return AppState.model_validate(state)


@app.delete("/state", status_code=status.HTTP_204_NO_CONTENT)
def reset_state(user: dict[str, str] = Depends(require_user)) -> Response:
    database.save_user_state(user["username"], default_state())
    return Response(status_code=status.HTTP_204_NO_CONTENT)
