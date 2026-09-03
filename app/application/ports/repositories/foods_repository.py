from typing import Protocol


class FoodRepository(Protocol):
    async def get_food_by_month(self, month: int):
        pass
