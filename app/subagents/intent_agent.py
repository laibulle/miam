from typing import Literal

from google.adk import Workflow, Agent, Event
from pydantic import BaseModel

from app.subagents.config import MODEL_NAME

DETAILED_MEAL = "detailed_meal"
WEEKLY_MENU = "weekly_menu"


class Intent(BaseModel):
    route: Literal[DETAILED_MEAL, WEEKLY_MENU]


def router(node_input: Intent):
    return Event(route=node_input.route)


intent_agent = Agent(
    name="intent_agent",
    model=MODEL_NAME,
    mode="single_turn",
    output_schema=Intent,
    instruction="""
        Classify the user's request:
        {user_request}
    
        - weekly_menu: plan meals across multiple days or create a weekly menu.
        - detailed_meal: provide a detailed recipe or meal.
    
        If the request does not explicitly ask for a multi-day meal plan,
        choose detailed_meal.
    
        Return the result using the configured output schema.
       """,
)
