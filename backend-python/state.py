import datetime
from typing import Any

from .schemas import AppState


PILLARS = {"Iron", "Mind", "General"}


def normalize_pillar(value: Any) -> str:
    text = str(value)
    if text in PILLARS:
        return text
    if "Iron" in text:
        return "Iron"
    if "Mind" in text:
        return "Mind"
    return "General"


def default_state() -> dict[str, Any]:
    return AppState().model_dump()


def clean_state(data: dict[str, Any] | None) -> dict[str, Any]:
    merged = default_state()
    if data:
        merged.update(data)
    state = AppState.model_validate(merged).model_dump()
    state["active_pillar"] = normalize_pillar(state["active_pillar"])
    for habit in state["habits"]:
        habit["pillar"] = normalize_pillar(habit.get("pillar", "General"))
    return state


def eval_streak(stats: dict[str, int], is_successful: bool) -> None:
    if is_successful:
        stats["current"] += 1
        stats["best"] = max(stats["best"], stats["current"])
    else:
        stats["prev"] = stats["current"]
        stats["current"] = 0


def process_midnight(state: dict[str, Any]) -> dict[str, Any]:
    state = clean_state(state)
    habits = state["habits"]

    iron = [h for h in habits if normalize_pillar(h["pillar"]) == "Iron"]
    mind = [h for h in habits if normalize_pillar(h["pillar"]) == "Mind"]
    general = [h for h in habits if normalize_pillar(h["pillar"]) == "General"]

    if habits:
        eval_streak(state["stats_master"], all(h["done"] for h in habits))
    if iron:
        eval_streak(state["stats_iron"], all(h["done"] for h in iron))
    if mind:
        eval_streak(state["stats_mind"], all(h["done"] for h in mind))
    if general:
        eval_streak(state["stats_general"], all(h["done"] for h in general))

    for habit in habits:
        habit["done"] = False

    active_events = []
    today = datetime.date.today().isoformat()
    for event in state["events"]:
        if event["done"]:
            event["done_date"] = event["done_date"] or today
            state["history"].append(event)
        else:
            active_events.append(event)
    state["events"] = active_events
    return state
