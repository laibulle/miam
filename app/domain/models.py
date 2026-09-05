from pydantic import BaseModel, Field, model_validator


class RecipesSuggestions(BaseModel):
    suggested_recipes: list[RecipeSuggestion]


class RecipeSuggestion(BaseModel):
    name: str
    ingredients: list[Ingredient]


class ExpertRecipesScore(BaseModel):
    scores: list[ExpertRecipeScore]
    user_instructions: str = Field(description="Practical advice addressed to the user.")


class ExpertRecipeScore(BaseModel):
    recipe_name: str
    score: int
    improvements: None | str = None
    substitutions: None | str = None


class ServingFoodFacts(BaseModel):
    energy_kcal: float = Field(ge=0)
    fat_g: float = Field(ge=0)
    carb_g: float = Field(ge=0)
    protein_g: float = Field(ge=0)
    fiber_g: float = Field(ge=0)


class FoodFacts(BaseModel):
    energy100: int
    fat100: int
    carb100: int
    prot100: int
    fiber100: int
    per_serving: ServingFoodFacts = Field(
        description="Estimated nutrients for one serving of the final recipe: recipe totals divided by servings."
    )


class ChiefRecipe(BaseModel):
    name: str
    preparation_duration_minutes: int
    cooking_duration_minutes: int
    description: str
    servings: int
    ingredients: list[Ingredient]
    steps: list[RecipeStep]
    tips: list[str]


class RecipeStep(BaseModel):
    abstract: str
    long_description: str
    duration: int | None = None
    timer: bool
    wait_for_end: bool


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


class FinalRecipe(BaseModel):
    recipe: ChiefRecipe
    nutritionist_quote: str
    nutritionist_score: int
    glut_health_expert_quote: str
    glut_health_expert_score: int
    food_facts: FoodFacts


class RecipeResponse(BaseModel):
    success: bool = Field(description="Whether a recipe was successfully generated.")
    recipe: FinalRecipe | None = Field(
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


class PlannedMeal(BaseModel):
    day: int = Field(description="Day name or date")
    meal: str = Field(description="Meal name")
    recipe_title: str = Field(
        description="Recipe titles",
    )
    ingredients: list[Ingredient]


class WeeklyMenu(BaseModel):
    meals: list[PlannedMeal] = Field(min_length=1)


class FinalWeeklyMenu(WeeklyMenu):
    user_instructions: str = Field(
        description="Consolidated expert advice consistent with the final menu."
    )
