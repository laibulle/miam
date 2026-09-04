import pytest
from pydantic import ValidationError

from app.domain.models import (
    ChiefRecipe,
    FinalRecipe,
    FoodFacts,
    Ingredient,
    RecipeResponse,
    RecipeStep,
)


@pytest.fixture
def recipe():
    return ChiefRecipe(
        name="Tomato pasta",
        preparation_duration_minutes=10,
        cooking_duration_minutes=20,
        description="A quick tomato pasta.",
        servings=2,
        ingredients=[Ingredient(name="Pasta", quantity=200, unit="g")],
        steps=[
            RecipeStep(
                abstract="Cook the pasta.",
                long_description="Boil the pasta in salted water for 10 minutes.",
                duration=10,
                timer=True,
                wait_for_end=True,
            )
        ],
        tips=["Reserve some pasta water for the sauce."],
    )


@pytest.fixture
def final_recipe(recipe):
    return FinalRecipe(
        recipe=recipe,
        nutritionist_quote="Add a protein source.",
        nutritionist_score=7,
        glut_health_expert_quote="Add vegetables for fiber.",
        glut_health_expert_score=8,
        food_facts=FoodFacts(energy100=150, fat100=3, carb100=25, prot100=5, fiber100=3),
    )


def test_success_response_requires_recipe(final_recipe):
    response = RecipeResponse(success=True, recipe=final_recipe)

    assert response.recipe == final_recipe
    assert response.description is None


def test_success_response_round_trips_nested_recipe(final_recipe):
    payload = {"success": True, "recipe": final_recipe.model_dump(mode="json")}

    response = RecipeResponse.model_validate(payload)

    assert isinstance(response.recipe, FinalRecipe)
    assert isinstance(response.recipe.recipe, ChiefRecipe)
    assert isinstance(response.recipe.recipe.steps[0], RecipeStep)
    assert isinstance(response.recipe.food_facts, FoodFacts)
    assert response.model_dump(exclude_none=True) == payload
    assert RecipeResponse.model_validate_json(response.model_dump_json()) == response


def test_success_response_rejects_recipe_without_expert_reviews(recipe):
    with pytest.raises(ValidationError):
        RecipeResponse(success=True, recipe=recipe.model_dump())


@pytest.mark.parametrize(
    "field",
    [
        "recipe",
        "nutritionist_quote",
        "nutritionist_score",
        "glut_health_expert_quote",
        "glut_health_expert_score",
        "food_facts",
    ],
)
def test_final_recipe_requires_each_field(final_recipe, field):
    payload = final_recipe.model_dump()
    del payload[field]

    with pytest.raises(ValidationError) as error:
        FinalRecipe.model_validate(payload)

    assert any(
        item["loc"] == (field,) and item["type"] == "missing" for item in error.value.errors()
    )


def test_chief_recipe_requires_tips(recipe):
    payload = recipe.model_dump()
    del payload["tips"]

    with pytest.raises(ValidationError) as error:
        ChiefRecipe.model_validate(payload)

    assert error.value.errors()[0]["loc"] == ("tips",)


def test_error_response_requires_description():
    response = RecipeResponse(success=False, description="Ask for a recipe.")

    assert response.recipe is None
    assert response.description == "Ask for a recipe."


@pytest.mark.parametrize(
    "payload",
    [
        {"success": True},
        {"success": True, "recipe": None},
        {"success": True, "description": "Unexpected error"},
        {"success": False},
        {"success": False, "description": ""},
        {"success": False, "description": "   "},
    ],
)
def test_response_rejects_inconsistent_payload(payload):
    with pytest.raises(ValidationError):
        RecipeResponse.model_validate(payload)


@pytest.mark.parametrize("success", [True, False])
def test_response_rejects_recipe_with_error_description(final_recipe, success):
    with pytest.raises(ValidationError):
        RecipeResponse(success=success, recipe=final_recipe, description="Unexpected error")
