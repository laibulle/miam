import httpx

BASE_URL = "https://impactco2.fr/api/v1/fruitsetlegumes?month="


class Impactco2FoodRepository:
    def __init__(self, client: httpx.AsyncClient):
        self.client = client
        super().__init__()

    async def get_food_by_month(self, month: int):
        response = await self.client.get(
            BASE_URL,
            params={"month": month},
        )
        response.raise_for_status()
        return response.json()
