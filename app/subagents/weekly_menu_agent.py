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
    Use integer day numbers starting at 1 for the first menu day.
    Each entry contains the day, meal name, one recipe_title, and ingredients
    required by the configured schema. Provide concrete ingredient quantities
    and explicit units for the requested serving count, defaulting to one
    serving when unspecified. These ingredients support downstream nutrition
    reviews and batch-cooking recommendations.
    Use concise, recognizable dish names rather than vague labels.
    When a meal includes accompaniments, combine their names into its single
    recipe_title and include their ingredients in that meal's ingredient list.

    Write all user-facing text in French.
    Do not include cooking instructions, nutritional values, explanations,
    or a separate shopping list.

    Return the result using the configured output schema.
    """,
)
