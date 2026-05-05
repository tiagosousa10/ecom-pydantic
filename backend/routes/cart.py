"""
    Shopping cart routes for adding and retrieving items.
"""

from fastapi import APIRouter
from ..models import CartItem
from ..database import cart_collection

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.post("/add")
def add_to_cart(item:CartItem):
    """
    Add an item to the shopping cart.
    """

    item_data = item.model_dump() if hasattr(item, 'model_dump') else item.dict()
    cart_collection.insert_one(item_data)
    return {"message": "Item added to cart"}


@router.get("/{user_email}")
def get_cart(user_email: str):
    """
    Retrieve all items in the user's cart.
    """
    items = []
    for doc in cart_collection.find({"user_email": user_email}):
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        items.append(doc)
    return items

#not utilized
@router.delete("/{user_email}")
def clear_cart(user_email: str):
    """
    clear the user's cart completely
    """

    cart_collection.delete_many({"user_email": user_email})
    return {"message": "Cart cleared successfully"}
