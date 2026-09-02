import httpx
import pytest
from pytest_httpx import HTTPXMock

from app.adapters.outbound.food_repository.impactco2_food_repository import (
    Impactco2FoodRepository,
)

@pytest.mark.asyncio
async def test_calories_per_serving(httpx_mock: HTTPXMock):
    httpx_mock.add_response(method="GET", url="https://impactco2.fr/api/v1/fruitsetlegumes?month=4", json=[])
    async with httpx.AsyncClient() as client:
        repo = Impactco2FoodRepository(client)
        assert await repo.get_food_by_month(4) == []
