from contextlib import contextmanager
import datetime
import json
import sqlite3
from typing import Any

try:
    import oracledb
except ImportError:
    oracledb = None

from .settings import get_settings


_oracle_pool = None


def _placeholder(position: int = 1) -> str:
    return f":{position}" if get_settings().using_oracle else "?"


def _placeholders(count: int) -> str:
    if get_settings().using_oracle:
        return ", ".join(_placeholder(i) for i in range(1, count + 1))
    return ", ".join("?" for _ in range(count))


def _get_oracle_pool():
    global _oracle_pool
    if _oracle_pool is not None:
        return _oracle_pool
    if oracledb is None:
        raise RuntimeError("Install oracledb to use Oracle Database.")

    settings = get_settings()
    if not all((settings.oracle_user, settings.oracle_password, settings.oracle_dsn)):
        raise RuntimeError("Set ORACLE_DB_USER, ORACLE_DB_PASSWORD, and ORACLE_DB_DSN.")

    args: dict[str, Any] = {
        "user": settings.oracle_user,
        "password": settings.oracle_password,
        "dsn": settings.oracle_dsn,
        "min": 1,
        "max": 5,
        "increment": 1,
    }
    if settings.oracle_wallet_location:
        args["config_dir"] = settings.oracle_wallet_location
        args["wallet_location"] = settings.oracle_wallet_location
    if settings.oracle_wallet_password:
        args["wallet_password"] = settings.oracle_wallet_password

    _oracle_pool = oracledb.create_pool(**args)
    return _oracle_pool


@contextmanager
def get_db():
    settings = get_settings()
    if settings.using_oracle:
        pool = _get_oracle_pool()
        conn = pool.acquire()
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            pool.release(conn)
        return

    conn = sqlite3.connect(settings.sqlite_path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def execute(sql: str, params: tuple[Any, ...] = ()) -> int:
    with get_db() as conn:
        if get_settings().using_oracle:
            with conn.cursor() as cur:
                cur.execute(sql, params)
                return cur.rowcount
        cur = conn.execute(sql, params)
        return cur.rowcount


def fetchone(sql: str, params: tuple[Any, ...] = ()):
    with get_db() as conn:
        if get_settings().using_oracle:
            with conn.cursor() as cur:
                cur.execute(sql, params)
                return cur.fetchone()
        return conn.execute(sql, params).fetchone()


def ensure_database_ready():
    if get_settings().using_oracle:
        execute(
            """
            BEGIN
                EXECUTE IMMEDIATE 'CREATE TABLE users (
                    username VARCHAR2(255) PRIMARY KEY,
                    display_name VARCHAR2(255) NOT NULL,
                    email VARCHAR2(320) NOT NULL UNIQUE,
                    password VARCHAR2(255) NOT NULL,
                    created_at VARCHAR2(32) NOT NULL
                )';
            EXCEPTION
                WHEN OTHERS THEN
                    IF SQLCODE != -955 THEN RAISE; END IF;
            END;
            """
        )
        execute(
            """
            BEGIN
                EXECUTE IMMEDIATE 'CREATE TABLE user_state (
                    username VARCHAR2(255) PRIMARY KEY,
                    data_json CLOB NOT NULL,
                    updated_at VARCHAR2(32) NOT NULL,
                    CONSTRAINT fk_state_user FOREIGN KEY (username)
                        REFERENCES users(username) ON DELETE CASCADE
                )';
            EXCEPTION
                WHEN OTHERS THEN
                    IF SQLCODE != -955 THEN RAISE; END IF;
            END;
            """
        )
        return

    execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            display_name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    execute(
        """
        CREATE TABLE IF NOT EXISTS user_state (
            username TEXT PRIMARY KEY,
            data_json TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
        )
        """
    )


def create_user(username: str, display_name: str, email: str, password_hash: str) -> dict[str, str]:
    created_at = datetime.datetime.now().isoformat(timespec="seconds")
    execute(
        f"INSERT INTO users (username, display_name, email, password, created_at) VALUES ({_placeholders(5)})",
        (username, display_name, email, password_hash, created_at),
    )
    return {
        "username": username,
        "display_name": display_name,
        "email": email,
        "password": password_hash,
        "created_at": created_at,
    }


def get_user(username: str) -> dict[str, str] | None:
    row = fetchone(
        "SELECT username, display_name, email, password, created_at FROM users WHERE username = " + _placeholder(),
        (username,),
    )
    if not row:
        return None
    return {
        "username": row[0],
        "display_name": row[1],
        "email": row[2],
        "password": row[3],
        "created_at": row[4],
    }


def email_exists(email: str) -> bool:
    return bool(fetchone("SELECT 1 FROM users WHERE email = " + _placeholder(), (email,)))


def save_user_state(username: str, data: dict[str, Any]) -> None:
    data_json = json.dumps(data)
    updated_at = datetime.datetime.now().isoformat(timespec="seconds")
    if get_settings().using_oracle:
        execute(
            """
            MERGE INTO user_state target
            USING (SELECT :1 AS username, :2 AS data_json, :3 AS updated_at FROM dual) source
            ON (target.username = source.username)
            WHEN MATCHED THEN
                UPDATE SET target.data_json = source.data_json, target.updated_at = source.updated_at
            WHEN NOT MATCHED THEN
                INSERT (username, data_json, updated_at)
                VALUES (source.username, source.data_json, source.updated_at)
            """,
            (username, data_json, updated_at),
        )
        return

    execute(
        """
        INSERT INTO user_state (username, data_json, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(username) DO UPDATE SET
            data_json = excluded.data_json,
            updated_at = excluded.updated_at
        """,
        (username, data_json, updated_at),
    )


def load_user_state(username: str) -> dict[str, Any] | None:
    row = fetchone("SELECT data_json FROM user_state WHERE username = " + _placeholder(), (username,))
    if not row:
        return None
    raw = row[0].read() if hasattr(row[0], "read") else row[0]
    return json.loads(raw)
