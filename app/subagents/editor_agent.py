from google.adk.agents.llm_agent import Agent

from app.domain.models import RecipeResponse
from app.subagents.config import MODEL_NAME

editor_agent = Agent(
    name="editor_agent",
    mode="single_turn",
    model=MODEL_NAME,
    output_schema=RecipeResponse,
    output_key="final_non_translated_response",
    instruction="""
    You assemble and present the final recipe in English.

    User request:
    {user_request}

    Final chef recipe:
    {chief_recipe}

    Nutrition expert evaluations:
    {nutritionist_score}

    Gut health expert evaluations:
    {glut_health_score}

    Estimated nutritional values:
    {food_facts}

    Match the selected recipe to each expert evaluation by its original name.
    Copy the scores exactly. Never invent, average, or revise them.
    Summarize each expert's reasoning and relevant recommendations faithfully.
    Include relevant user_instructions in the corresponding expert quote,
    keeping only advice for the selected recipe that fits the chef's final version.
    Explain that the scores evaluate the initial suggestion, before the chef's
    adjustments; do not claim the final recipe was reassessed.

    Preserve the chef's recipe, ingredient quantities, servings, step order,
    durations in seconds, and timer flags. Do not add or remove cooking advice.
    Copy food_facts exactly, including per_serving and all per-100-gram values.
    Mention that nutritional values are estimates without recalculating them.

    Write user-facing text in English. A dedicated translator will handle French.
    Return plain Unicode text inside JSON strings, never HTML entities.
    Preserve the configured schema keys and structure.

    Return success=true only when all required information is available and
    can be matched consistently. Otherwise return success=false with a clear
    description of the problem.
    Return the result using the configured output schema.
    """,
)
