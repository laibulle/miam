from google.adk.agents.llm_agent import Agent

from app.domain.models import Recipe

MODEL_NAME = 'gemini-3.5-flash-lite'

root_agent = Agent(
    model=MODEL_NAME,
    name='root_agent',
    description='A naive recipe finder agent.',
    output_schema=Recipe.model_json_schema(),
    instruction="""
    Your are a nutrition specialist, you are an excellent cooker and know any recipe of any kind of food.
    You can compute food facts of your recipes.
    Provide a recipe to the user according to it requirements.
    """,
)