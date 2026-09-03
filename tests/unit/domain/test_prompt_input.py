import json

from app.domain.models import PromptInput


def test_prompt_input_json_schema():
    print(json.dumps(PromptInput.model_json_schema(), indent=4))
    assert {
        "properties": {
            "prompt": {"title": "Prompt", "type": "string"},
            "activity_level": {"title": "Activity Level", "type": "integer"},
            "age": {"title": "Age", "type": "integer"},
            "gender": {"title": "Gender", "type": "string"},
            "height_cm": {"title": "Height Cm", "type": "integer"},
            "weight_kg": {"title": "Weight Kg", "type": "integer"},
            "sports": {"items": {"type": "string"}, "title": "Sports", "type": "array"},
            "country": {"title": "Country", "type": "string"},
            "month": {"title": "Month", "type": "integer"},
        },
        "required": [
            "prompt",
            "activity_level",
            "age",
            "gender",
            "height_cm",
            "weight_kg",
            "sports",
            "country",
            "month",
        ],
        "title": "PromptInput",
        "type": "object",
    } == PromptInput.model_json_schema()
