from app.domain.models import Recipe


def test_recipe_json_schema():
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
                    "content": {"title": "Content", "type": "string"},
                    "duration": {
                        "anyOf": [{"type": "integer"}, {"type": "null"}],
                        "title": "Duration",
                    },
                },
                "required": ["content", "duration"],
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
            "energy100": {"title": "Energy100", "type": "integer"},
            "fat100": {"title": "Fat100", "type": "integer"},
            "carb100": {"title": "Carb100", "type": "integer"},
            "prot100": {"title": "Prot100", "type": "integer"},
        },
        "required": [
            "name",
            "preparation_duration_minutes",
            "cooking_duration_minutes",
            "description",
            "servings",
            "ingredients",
            "steps",
            "energy100",
            "fat100",
            "carb100",
            "prot100",
        ],
        "title": "Recipe",
        "type": "object",
    } == Recipe.model_json_schema()
