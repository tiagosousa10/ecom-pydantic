"""
order management routes for adding and retrieving orders
"""

from fastapi import APIRouter
from ..models import Order
from ..database import orders_collection

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("")
def place_order(order: Order):
    """
    place a new order for a user
    """
    order_data = order.model_dump() if hasattr(order, 'model_dump') else order.dict()
    orders_collection.insert_one(order_data)
    return {"message": "Order placed successfully"}
