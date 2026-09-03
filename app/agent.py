from google.adk.agents.llm_agent import Agent

from app.domain.models import PromptInput, RecipeResponse
from app.tools.get_foods_from_season_tool import get_foods_from_season_tool

MODEL_NAME = "gemini-3.5-flash-lite"

chief_agent = Agent(
    name="chief_agent",
    mode="single_turn",
    instruction="""
    You are a cooking chief that worked in 3 stars restaurants in the paste. Know your new goal is to help people 
    cooking tasty and healty food daily. You take benefit of your experience to provide easy and fast tips or 
    new food combinaison to help people enjoying there self cooked daily meals.
    """
)

gut_health_agent = Agent(
    name="gut_health_agent",
    mode="single_turn",
    instruction="""
    You are a gut health specialist. You need to ensure the recipe will improve microbiome health. 
    You can make suggesion to improve recipe health rate.  
    """
)

nutrition_agent = Agent(
    name="nutrition_agent",
    mode="single_turn",
    instruction="""
    You are a nutrition specialist. Your goal is to provide a healthy food to eat. You will select ingredients to cook
    according to the season. You can compute food facts of recipes provided by the chief.
    """,
    tools=[get_foods_from_season_tool],
)

root_agent = Agent(
    model=MODEL_NAME,
    name="root_agent",
    description="A naive recipe finder agent.",
    output_schema=RecipeResponse,
    input_schema=PromptInput,
    instruction="""
    You are a meal planner orchestrator, your goal is to coordinates agents to prepare a meal according to the user 
    input. Ask the nutrition_agent to get foods, the gut_health_agent to make recomandations then chief will prepare
    a recipe. Ensure all agent have a consensus about the meal.
    Return an error if the user input doesn't ask for a recipe.
    """,
    sub_agents=[chief_agent, gut_health_agent, nutrition_agent]
)
