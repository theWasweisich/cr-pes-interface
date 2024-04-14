from typing import Literal
from datetime import datetime
from dataclasses import dataclass

@dataclass
class Crêpe:
    id: int
    name: str
    price: float
    type_: Literal["süß"] | Literal["deftig"] | Literal["spezial"] | Literal["sonstiges"]

@dataclass
class Sale:
    id: int | None
    time: datetime
    crêpes: list[Crêpe]
    total: float
    ownConsumption: bool = False


@dataclass
class Ingredient:
    id: int | None
    name: str | None
    longname: str | None


@dataclass
class Ingredient_Item:
    id: int | None
    ingredientID: int
    crêpeID: int
    amountUsed: str
    amountUnit: str
