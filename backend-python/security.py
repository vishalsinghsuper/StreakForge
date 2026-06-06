import datetime
import hashlib
import hmac
import secrets

from .settings import get_settings


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored_password: str) -> bool:
    try:
        salt, expected_hash = stored_password.split("$", 1)
    except ValueError:
        return False

    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000)
    return hmac.compare_digest(digest.hex(), expected_hash)


def make_token(username: str) -> str:
    settings = get_settings()
    expires_at = int((datetime.datetime.now() + datetime.timedelta(days=settings.session_days)).timestamp())
    payload = f"{username}|{expires_at}"
    signature = hmac.new(settings.auth_secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload}|{signature}"


def verify_token(token: str | None) -> str | None:
    if not token:
        return None

    try:
        username, expires_at, signature = token.split("|", 2)
        expires_at_int = int(expires_at)
    except (TypeError, ValueError):
        return None

    if expires_at_int < int(datetime.datetime.now().timestamp()):
        return None

    settings = get_settings()
    payload = f"{username}|{expires_at}"
    expected = hmac.new(settings.auth_secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, expected):
        return None
    return username
