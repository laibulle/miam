from google.adk import Agent

from app.domain.models import WeeklyMenu
from app.subagents.config import MODEL_NAME

menu_editor_agent = Agent(
    name="menu_editor_agent",
    mode="single_turn",
    model=MODEL_NAME,
    output_schema=WeeklyMenu,
    output_key="final_non_translated_menu",
    instruction="""
    Edit the weekly menu into its final version in English.

    User request: {user_request}
    Menu: {weekly_menu}
    Nutrition advice: {weekly_nutritionist_score}
    Gut health advice: {weekly_gut_health_score}
    Batch-cooking advice: {batch_cooker_score}

    Apply useful expert recommendations, reorder meals for safe storage,
    and incorporate substitutions that simplify shared cooking and shopping.
    Match advice by original day, meal, and recipe title. Preserve requested
    days, meal types, servings, and dietary constraints without losing meals.
    Resolve conflicts in favor of food safety and user constraints.

    Update titles and ingredient quantities consistently with accepted changes.
    Return meals in chronological order using the configured schema, without
    scores, commentary, or detailed cooking instructions.
    """,
)
