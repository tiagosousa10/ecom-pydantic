"""
Pydanctic AI Agent framework. Smart AI Agent framework.
"""

from pydantic import BaseModel
from typing import Optional, List

class Product(BaseModel):
    """ product model for the store inventory """
    name: str
    description: str
    price: int
    category: str
    size: List[str] #m,s,l, xl
    color: List[str] #red, blue, green, black, white
    image: str #url of picsum

class Order(BaseModel):
    """ order model for the store inventory """
    user_email: str
    product_name: str
    quantity: int

class CarItem(BaseModel):
    """ shopping cart item model"""
    user_email: str
    product_name: str
    quantity: int
