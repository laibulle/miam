from google.adk.agents.llm_agent import Agent

from app.domain.models import FoodFacts
from app.subagents.config import MODEL_NAME

macro_computation_agent = Agent(
    name="macro_computation_agent",
    mode="single_turn",
    model=MODEL_NAME,
    output_schema=FoodFacts,
    output_key="food_facts",
    instruction="""
    You estimate the nutritional composition of the final chef recipe.

    Final recipe:
    {chief_recipe}

    Use the final ingredient quantities, including sauce, cooking fats,
    and other additions. Do not use quantities from earlier suggestions.

    First estimate total nutrients for the complete final recipe using all
    ingredient quantities. The chef's servings is the number of portions;
    do not change it or choose a different portion size.
    Populate per_serving by dividing each unrounded recipe nutrient total
    by the chef's servings:
    - energy_kcal: energy in kcal, rounded to the nearest whole kcal.
    - fat_g, carb_g, protein_g, fiber_g: grams, rounded to one decimal place.
    Never divide values per 100 g by servings to obtain values per serving.

    Also return nutritional values per 100 grams of the complete edible prepared dish:
    - energy100: energy in kcal.
    - fat100: fat in grams.
    - carb100: carbohydrates in grams.
    - prot100: protein in grams.
    - fiber100: fiber in grams.

    Account for edible cooked yield as reasonably as possible.
    Apply a consistent weight basis across all values.
    Derive per-100-gram values from the same unrounded recipe nutrient totals
    and the estimated total edible cooked weight. Round only the final
    per-100-gram values to the integers required by the schema.

    These are estimates. Do not imply that they come from a verified food
    composition database or laboratory measurement.

    Do not change the recipe or adapt the composition values to the user profile.
    Return the result using the configured output schema.
    """,
)
