from app.domain.models import ChiefRecipe, ExpertRecipeScore, RecipeResponse


def test_chief_recipe_json_schema():
    assert {
        "$defs": {
            "Ingredient": {
                "properties": {
                    "name": {"title": "Name", "type": "string"},
                    "quantity": {"title": "Quantity", "type": "integer"},
                    "unit": {"title": "Unit", "type": "string"},
                },
                "required": ["name", "quantity", "unit"],
                "title": "Ingredient",
                "type": "object",
            },
            "RecipeStep": {
                "properties": {
                    "abstract": {"title": "Abstract", "type": "string"},
                    "long_description": {"title": "Long Description", "type": "string"},
                    "duration": {
                        "anyOf": [{"type": "integer"}, {"type": "null"}],
                        "default": None,
                        "title": "Duration",
                    },
                    "timer": {"title": "Timer", "type": "boolean"},
                    "wait_for_end": {"title": "Wait For End", "type": "boolean"},
                },
                "required": ["abstract", "long_description", "timer", "wait_for_end"],
                "title": "RecipeStep",
                "type": "object",
            },
        },
        "properties": {
            "name": {"title": "Name", "type": "string"},
            "preparation_duration_minutes": {
                "title": "Preparation Duration Minutes",
                "type": "integer",
            },
            "cooking_duration_minutes": {"title": "Cooking Duration Minutes", "type": "integer"},
            "description": {"title": "Description", "type": "string"},
            "servings": {"title": "Servings", "type": "integer"},
            "ingredients": {
                "items": {"$ref": "#/$defs/Ingredient"},
                "title": "Ingredients",
                "type": "array",
            },
            "steps": {"items": {"$ref": "#/$defs/RecipeStep"}, "title": "Steps", "type": "array"},
            "tips": {"items": {"type": "string"}, "title": "Tips", "type": "array"},
        },
        "required": [
            "name",
            "preparation_duration_minutes",
            "cooking_duration_minutes",
            "description",
            "servings",
            "ingredients",
            "steps",
            "tips",
        ],
        "title": "ChiefRecipe",
        "type": "object",
    } == ChiefRecipe.model_json_schema()


def test_recipe_response_schema_uses_final_recipe_with_expert_reviews():
    schema = RecipeResponse.model_json_schema()

    assert schema["properties"]["recipe"]["anyOf"] == [
        {"$ref": "#/$defs/FinalRecipe"},
        {"type": "null"},
    ]
    final_recipe = schema["$defs"]["FinalRecipe"]
    assert final_recipe["properties"]["recipe"] == {"$ref": "#/$defs/ChiefRecipe"}
    assert final_recipe["properties"]["food_facts"] == {"$ref": "#/$defs/FoodFacts"}
    assert final_recipe["required"] == [
        "recipe",
        "nutritionist_quote",
        "nutritionist_score",
        "glut_health_expert_quote",
        "glut_health_expert_score",
        "food_facts",
    ]
    chief_recipe = schema["$defs"]["ChiefRecipe"]
    assert chief_recipe["properties"]["tips"] == {
        "items": {"type": "string"},
        "title": "Tips",
        "type": "array",
    }
    assert "tips" in chief_recipe["required"]


def test_expert_score_schema_has_optional_nullable_recommendations():
    schema = ExpertRecipeScore.model_json_schema()

    assert schema["required"] == ["recipe_name", "score"]
    for field in ("improvements", "substitutions"):
        assert schema["properties"][field]["default"] is None
        assert {option["type"] for option in schema["properties"][field]["anyOf"]} == {
            "string",
            "null",
        }
