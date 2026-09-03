import pytest
from pydantic import ValidationError

from app.domain.models import Ingredient, Recipe, RecipeResponse, RecipeStep


@pytest.fixture
def recipe():
    return Recipe(
        name="Tomato pasta",
        preparation_duration_minutes=10,
        cooking_duration_minutes=20,
        description="A quick tomato pasta.",
        servings=2,
        ingredients=[Ingredient(name="Pasta", quantity=200, unit="g")],
        steps=[RecipeStep(content="Cook the pasta.", duration=10)],
        energy100=150,
        fat100=3,
        carb100=25,
        prot100=5,
    )


def test_success_response_requires_recipe(recipe):
    response = RecipeResponse(success=True, recipe=recipe)

    assert response.recipe == recipe
    assert response.description is None


def test_error_response_requires_description():
    response = RecipeResponse(success=False, description="Ask for a recipe.")

    assert response.recipe is None
    assert response.description == "Ask for a recipe."


@pytest.mark.parametrize(
    "payload",
    [
        {"success": True},
        {"success": True, "description": "Unexpected error"},
        {"success": False},
    ],
)
def test_response_rejects_inconsistent_payload(payload):
    with pytest.raises(ValidationError):
        RecipeResponse.model_validate(payload)
