from pydantic import BaseModel
from typing import List, Optional

class Recipe(BaseModel):
  name: str
  preparation_duration_minutes: int
  cooking_duration_minutes: int
  description: str
  servings: int
  ingredients: List[Ingredient]
  steps: List[RecipeStep]
  energy100: int
  fat100: int
  carb100: int
  prot100: int

class RecipeStep(BaseModel):
  content: str
  duration: Optional[int]

class Ingredient(BaseModel):
  name: str
  quantity: int
  unit: str