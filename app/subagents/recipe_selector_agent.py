from google.adk.agents.llm_agent import Agent

from app.domain.models import RecipesSuggestions
from app.subagents.config import MODEL_NAME

recipe_selector_agent = Agent(
    name="recipe_selector_agent",
    mode="single_turn",
    model=MODEL_NAME,
    output_schema=RecipesSuggestions,
    output_key="recipes_suggestions",
    instruction="""
    You select exactly 3 distinct recipes that are easy to cook.

    User request:
    {user_request}

    User profile:
    {user_profile}

    Seasonal foods:
    {season_foods}

    Preserve the user's explicitly requested foods and meal preferences.
    For example, a request for fries and a sauce should remain recognizable
    in each suggestion.

    Use the country to contextualize ingredient availability and cooking habits.
    Favor the supplied seasonal foods where they fit the request.
    Do not assume the seasonal list applies to the user's country if its
    geographic coverage is unspecified.

    Use the profile to guide reasonable ingredient quantities.
    Do not infer allergies, medical conditions, weight-loss goals, or training
    intensity. Do not interpret a numeric activity level without a defined scale.

    Propose quantities for one serving so the experts can compare recipes
    on a consistent basis. Use clear units.

    Do not score the recipes. The experts will evaluate them.
    Return the result using the configured output schema.
    """,
)
