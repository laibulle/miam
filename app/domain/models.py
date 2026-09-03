from pydantic import BaseModel, Field, model_validator


class Recipe(BaseModel):
    name: str
    preparation_duration_minutes: int
    cooking_duration_minutes: int
    description: str
    servings: int
    ingredients: list[Ingredient]
    steps: list[RecipeStep]
    energy100: int
    fat100: int
    carb100: int
    prot100: int


class RecipeStep(BaseModel):
    content: str
    duration: int | None


class Ingredient(BaseModel):
    name: str
    quantity: int
    unit: str


class PromptInput(BaseModel):
    prompt: str
    activity_level: int
    age: int
    gender: str
    height_cm: int
    weight_kg: int
    sports: list[str]
    country: str
    month: int


class RecipeResponse(BaseModel):
    success: bool = Field(description="Whether a recipe was successfully generated.")
    recipe: Recipe | None = Field(
        default=None,
        description="The generated recipe. Required when success is true.",
    )
    description: str | None = Field(
        default=None,
        description="A user-facing error description. Required when success is false.",
    )

    @model_validator(mode="after")
    def validate_result(self):
        if self.success:
            if self.recipe is None:
                raise ValueError("recipe is required when success is true")
            if self.description is not None:
                raise ValueError("description must be omitted when success is true")
        else:
            if self.recipe is not None:
                raise ValueError("recipe must be omitted when success is false")
            if not self.description or not self.description.strip():
                raise ValueError("description is required when success is false")

        return self
