import json

import httpx
import pytest
from pytest_httpx import HTTPXMock

from app.adapters.outbound.food_repository.impactco2_food_repository import (
    Impactco2FoodRepository,
)

data_sample = json.loads("""
{"data":[{"name":"Pomme","slug":"pomme","months":[1,2,3,4,8,9,10,11,12],"ecv":0.40819489999999997,"category":"fruits"},{"name":"Ail","slug":"ail","months":[7,8,9,10,11,12],"ecv":0.38349300000000003,"category":"herbes"}],"warning":"La requete n'est pas authentifiée. Nous nous reservons le droit de couper cette API aux utilisateurs anonymes, veuillez nous contacter à impactco2@ademe.fr pour obtenir une clé d'API gratuite."}
""")


@pytest.mark.asyncio
async def test_calories_per_serving(httpx_mock: HTTPXMock):
    httpx_mock.add_response(
        method="GET", url="https://impactco2.fr/api/v1/fruitsetlegumes?month=4", json=data_sample
    )
    async with httpx.AsyncClient() as client:
        repo = Impactco2FoodRepository(client)
        assert await repo.get_food_by_month(4) == ["pomme", "ail"]
