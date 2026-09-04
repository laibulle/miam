from google.adk import Event, Workflow
from google.adk.agents.llm_agent import Agent

from app.domain.models import (
    ChiefRecipe,
    ExpertRecipesScore,
    FoodFacts,
    PromptInput,
    RecipeResponse,
    RecipesSuggestions,
)
from app.tools.get_foods_from_season_tool import get_foods_from_season_tool

MODEL_NAME = "gemini-3.5-flash-lite"

gut_health_agent = Agent(
    name="gut_health_agent",
    mode="single_turn",
    model=MODEL_NAME,
    output_schema=ExpertRecipesScore,
    output_key="glut_health_score",
    instruction="""
    You are a gut health specialist. You need to rate all the suggested recipes in regard of the gut microbiome health and 
    also the brain. 
    You can eventually propose improvement to the recipe or replace ingredients or quantities according to
    the available food for the season. Your rating is totally independent of any other expert rate you have your own opinion
    """,
)

nutrition_agent = Agent(
    name="nutrition_agent",
    mode="single_turn",
    model=MODEL_NAME,
    output_schema=ExpertRecipesScore,
    output_key="nutritionist_score",
    instruction="""
    You are a nutrition specialist. You need to rate all the suggested recipes to provide good macro balance according to
    the user profile. You can eventually propose improvement to the recipe or replace ingredients or quantities according to
    the available food for the season. Your rating is totally independent of any other expert rate you have your own opinion.
    """,
)

macro_computation_agent = Agent(
    name="macro_computation_agent",
    mode="single_turn",
    model=MODEL_NAME,
    output_schema=FoodFacts,
    output_key="food_facts",
    instruction="""
    You can compute food facts of recipes provided by the chief plus fiber.
    """,
)


async def fetch_foods_for_season(node_input: PromptInput):
    yield Event(
        state={
            "season_foods": await get_foods_from_season_tool(node_input.month),
            "attempts": 0,
            "consensus": False,
        }
    )


recipe_selector_agent = Agent(
    name="recipe_selector_agent",
    mode="single_turn",
    model=MODEL_NAME,
    output_schema=RecipesSuggestions,
    output_key="recipes_suggestions",
    instruction="""
    You are a recipe selector agent. You select 3 recipes that are easy to cook according to user ask to the
    available foods for the season.
    """,
)

chief_agent = Agent(
    name="chief_agent",
    mode="single_turn",
    model=MODEL_NAME,
    output_schema=ChiefRecipe,
    output_key="chief_recipe",
    instruction="""
    You are a cooking chief that worked in 3 stars restaurants in the paste. Know your new goal is to help people 
    cooking tasty and healthy food daily. 
    You have several recipes suggestions, pick one according to it rate and improvements but at the end the most important 
    think is the taste and how easy it is for the user to cook it so you have the final word.
     
    You take benefit of your experience to provide easy and fast tips to elevate the recipe. You provide easy steps abstracts
    but a really details instruction in long_description. You also define if this step is a timer for exemple during oven
    or fridge reservation and if we need to wait or can go to the next step.
    """,
)

editor_agent = Agent(
    name="editor_agent",
    mode="single_turn",
    model=MODEL_NAME,
    output_schema=RecipeResponse,
    instruction="""
    Your role is to present the recipe to the user
    """,
)

root_agent = Workflow(
    name="root_agent",
    edges=[
        (
            "START",
            fetch_foods_for_season,
            recipe_selector_agent,
            nutrition_agent,
            gut_health_agent,
            chief_agent,
            macro_computation_agent,
            editor_agent,
        ),
    ],
)
