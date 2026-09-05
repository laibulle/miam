from google.adk import Agent

from app.domain.models import FinalWeeklyMenu
from app.subagents.config import MODEL_NAME

menu_editor_agent = Agent(
    name="menu_editor_agent",
    mode="single_turn",
    model=MODEL_NAME,
    output_schema=FinalWeeklyMenu,
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
    Merge the experts' user_instructions into practical guidance for the user,
    removing duplicates and advice that no longer fits the edited menu. Update
    meal references after reordering and preserve necessary storage guidance.
    Return chronological meals and user_instructions in the configured schema,
    without scores or full recipes.
    """,
)
