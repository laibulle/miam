import pytest
from pydantic import ValidationError

from app.domain.models import FinalWeeklyMenu, WeeklyMenu


@pytest.fixture
def menu_payload():
    return {
        "meals": [
            {
                "day": 1,
                "meal": "Dinner",
                "recipe_title": "Tomato pasta",
                "ingredients": [{"name": "Pasta", "quantity": 100, "unit": "g"}],
            }
        ],
        "user_instructions": "Prepare the sauce on day -1.",
    }


def test_final_menu_preserves_meals_and_instructions(menu_payload):
    menu = FinalWeeklyMenu.model_validate(menu_payload)

    assert menu.meals[0].ingredients[0].quantity == 100
    assert menu.model_dump() == menu_payload


@pytest.mark.parametrize("model", [WeeklyMenu, FinalWeeklyMenu])
def test_menu_requires_at_least_one_meal(model, menu_payload):
    menu_payload["meals"] = []

    with pytest.raises(ValidationError, match="meals"):
        model.model_validate(menu_payload)


def test_only_final_menu_requires_user_instructions(menu_payload):
    del menu_payload["user_instructions"]

    assert WeeklyMenu.model_validate(menu_payload).model_dump() == menu_payload
    with pytest.raises(ValidationError, match="user_instructions"):
        FinalWeeklyMenu.model_validate(menu_payload)
