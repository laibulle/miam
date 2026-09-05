from google.adk import Event, Workflow

from app.domain.models import PromptInput
from app.subagents.weekly_menu_agent import weekly_menu_agent
from app.subagents.chief_agent import chief_agent
from app.subagents.editor_agent import editor_agent
from app.subagents.french_translator_agent import french_translator_agent
from app.subagents.gut_health_agent import gut_health_agent
from app.subagents.intent_agent import intent_agent, router
from app.subagents.macro_computation_agent import macro_computation_agent
from app.subagents.nutrition_agent import nutrition_agent
from app.subagents.recipe_selector_agent import recipe_selector_agent
from app.tools.get_foods_from_season_tool import get_foods_from_season_tool


async def fetch_input_data(node_input: PromptInput):
    yield Event(
        state={
            "user_request": node_input.prompt,
            "user_profile": node_input.model_dump_json(exclude={"prompt"}),
            "season_foods": await get_foods_from_season_tool(node_input.month),
        }
    )


detailed_meal_workflow = Workflow(
    name="detailed_meal_workflow",
    edges=[
        (
            "START",
            recipe_selector_agent,
            nutrition_agent,
            gut_health_agent,
            chief_agent,
            macro_computation_agent,
            editor_agent,
            french_translator_agent,
        ),
    ],
)

weekly_menu_workflow = Workflow(
    name="weekly_menu_workflow",
    edges=[
        ("START", weekly_menu_agent),
    ],
)

root_agent = Workflow(
    name="root_agent",
    edges=[
        ("START", fetch_input_data, intent_agent, router),
        (
            router,
            {
                "detailed_meal": detailed_meal_workflow,
                "weekly_menu": weekly_menu_workflow,
            },
        ),

    ],
)
