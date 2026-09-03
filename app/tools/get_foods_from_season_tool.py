import httpx

from app.adapters.outbound.food_repository.impactco2_food_repository import Impactco2FoodRepository


async def get_foods_from_season_tool(month: int):
    async with httpx.AsyncClient() as client:
        foods_repo = Impactco2FoodRepository(client)
        return {"status": "success", "foods": await foods_repo.get_food_by_month(month)}
