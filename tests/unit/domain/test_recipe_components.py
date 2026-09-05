import pytest
from pydantic import ValidationError

from app.domain.models import (
    ExpertRecipeScore,
    ExpertRecipesScore,
    FoodFacts,
    Ingredient,
    RecipesSuggestions,
    RecipeStep,
    RecipeSuggestion,
)


@pytest.fixture
def step_payload():
    return {
        "abstract": "Cook the pasta.",
        "long_description": "Boil the pasta in salted water for 10 minutes.",
        "duration": 10,
        "timer": True,
        "wait_for_end": True,
    }


@pytest.mark.parametrize("duration", [10, None])
def test_recipe_step_accepts_nullable_duration(step_payload, duration):
    step_payload["duration"] = duration

    assert RecipeStep.model_validate(step_payload).model_dump() == step_payload


@pytest.mark.parametrize("field", ["abstract", "long_description", "timer", "wait_for_end"])
def test_recipe_step_requires_each_field(step_payload, field):
    del step_payload[field]

    with pytest.raises(ValidationError) as error:
        RecipeStep.model_validate(step_payload)

    assert error.value.errors()[0]["loc"] == (field,)
    assert error.value.errors()[0]["type"] == "missing"


def test_recipe_step_defaults_missing_duration_to_none(step_payload):
    del step_payload["duration"]

    step = RecipeStep.model_validate(step_payload)

    assert step.duration is None
    assert step.model_dump() == {**step_payload, "duration": None}


def test_recipe_step_rejects_invalid_duration(step_payload):
    step_payload["duration"] = "unknown"

    with pytest.raises(ValidationError):
        RecipeStep.model_validate(step_payload)


def test_recipe_step_accepts_disabled_timer_and_wait(step_payload):
    step_payload.update(duration=None, timer=False, wait_for_end=False)

    assert RecipeStep.model_validate(step_payload).model_dump() == step_payload


def test_recipes_suggestions_parse_nested_ingredients():
    payload = {
        "suggested_recipes": [
            {
                "name": "Tomato pasta",
                "ingredients": [{"name": "Pasta", "quantity": 200, "unit": "g"}],
            }
        ]
    }

    suggestions = RecipesSuggestions.model_validate(payload)

    assert isinstance(suggestions.suggested_recipes[0], RecipeSuggestion)
    assert isinstance(suggestions.suggested_recipes[0].ingredients[0], Ingredient)
    assert suggestions.model_dump() == payload


@pytest.mark.parametrize(
    ("improvements", "substitutions"),
    [(None, None), ("Add vegetables.", "Use whole-wheat pasta.")],
)
def test_expert_scores_accept_nullable_recommendations(improvements, substitutions):
    payload = {
        "scores": [
            {
                "recipe_name": "Tomato pasta",
                "score": 8,
                "improvements": improvements,
                "substitutions": substitutions,
            }
        ]
    }

    review = ExpertRecipesScore.model_validate(payload)

    assert isinstance(review.scores[0], ExpertRecipeScore)
    assert review.model_dump() == payload


@pytest.mark.parametrize(
    "fields", [("improvements",), ("substitutions",), ("improvements", "substitutions")]
)
def test_expert_score_defaults_missing_recommendations_to_none(fields):
    payload = {
        "recipe_name": "Tomato pasta",
        "score": 8,
        "improvements": None,
        "substitutions": None,
    }
    for field in fields:
        del payload[field]

    score = ExpertRecipeScore.model_validate(payload)

    assert score.improvements is None
    assert score.substitutions is None
    assert score.model_dump() == {**payload, "improvements": None, "substitutions": None}


def test_food_facts_include_fiber():
    payload = {
        "energy100": 150,
        "fat100": 3,
        "carb100": 25,
        "prot100": 5,
        "fiber100": 3,
        "per_serving": {
            "energy_kcal": 600,
            "fat_g": 12,
            "carb_g": 100,
            "protein_g": 20,
            "fiber_g": 12.5,
        },
    }

    assert FoodFacts.model_validate(payload).model_dump() == payload

    del payload["fiber100"]
    with pytest.raises(ValidationError) as error:
        FoodFacts.model_validate(payload)

    assert error.value.errors()[0]["loc"] == ("fiber100",)


def test_food_facts_require_per_serving():
    with pytest.raises(ValidationError) as error:
        FoodFacts(energy100=150, fat100=3, carb100=25, prot100=5, fiber100=3)
    assert error.value.errors()[0]["loc"] == ("per_serving",)
