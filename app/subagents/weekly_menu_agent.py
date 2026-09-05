from google.adk import Agent

from app.domain.models import WeeklyMenu
from app.subagents.config import MODEL_NAME


weekly_menu_agent = Agent(
    name="weekly_menu_agent",
    model=MODEL_NAME,
    mode="single_turn",
    output_schema=WeeklyMenu,
    output_key="weekly_menu",
    instruction="""
    You plan varied, practical weekly menus.

    User request:
    {user_request}

    User profile:
    {user_profile}

    Seasonal foods:
    {season_foods}

    Plan the entire requested period as a coherent menu.

    Follow the user's requested days and meal types.
    If no period is specified, plan seven days from Monday to Sunday.
    If no meal types are specified, include lunch and dinner.
    When the user requests dinners only, do not include other meals.

    Respect explicitly stated dietary restrictions, preferences,
    exclusions, budget, and cooking-time constraints.
    Do not infer allergies, medical conditions, or weight-loss goals.

    Favor seasonal foods where appropriate.
    Use the user's country to contextualize the menu.
    Do not assume the seasonal list covers that country if its
    geographic coverage is unspecified.

    Vary dishes and main ingredients across the requested period.
    Avoid repeating the same dish unless the user requests repetition
    or leftovers. Reuse ingredients where practical to reduce waste.

    Create exactly one entry per requested day and meal.
    Keep entries in chronological order.
    Each entry contains only the day, meal name, and recipe titles.
    Use concise, recognizable dish names rather than vague labels.
    Include multiple recipe titles only when a meal needs
    distinct dishes or accompaniments.

    Write all user-facing text in French.
    Do not include ingredients, quantities, instructions, nutritional
    values, explanations, or shopping lists.

    Return the result using the configured output schema.
    """,
)