"""
chatbot api - text2nosql shopping assistant using pydantic ai

how it works:
- normal conversation (greetings, questions): agents replies with plain text.
- product queries(show me X, find Y under Z price): agent calls `search_products` tool which queries mongodb and returns matching products
- the endpoint figures out which type of response to send to the frontend.
"""

from fastapi import APIRouter, Body
from backend.database import products_collection
from pydantic_ai import Agent, RunContext
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/chat", tags=["Chatbot"])

# agent dependicies: carries the product search

class StoreDeps(BaseModel):
    """ Holds the list of products returned by the search tool """
    found_products: List[Dict[str, Any]] = []

    class Config:
        arbitrary_types_allowed = True


# agent - plain string outpuut (simple & reliable)
# we detect product queries from tool usage, NOT
# by forcing a rigid output schema on the llm.

agent = Agent(
    "groq:llama-3.1-8b-instant",
    deps_type=StoreDeps, # the way it will output
    system_prompt=(
        "You are a friendly shopping assistant for ClothStore - an online clothing store."
        "The store has 3 categories: Men, Women, Kids."
        "\n\n"
        "Rules:\n"
        "1. if the uuser greets you or asks who are you -> reply naturally and be friendly\n"
        "2. iif the user wants to browse, find, or buy products -> allways call the `search_products` tool\n"
        "3. after calling `search_products` tool, confirm to the user what you searched for(e.g. 'e.g. here are men's shirts under ₹2000')\n"
        "4. if the user asks something completely unrelated to shopping, the agent always replies:\n"
        "'Sorry, I can't help with that. For assistance, contact our customer care at 546464434.'"
        "5. DO NOT make up product names, prices or details ever."

    ),
)

@agent.tool
def search_products(
    ctx: RunContext[StoreDeps],
    category: Optional[str] = None,
    keyword: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
)-> str:
    """
    Search the ClothStore product database.

    Args:
        category (str): The category of the product (e.g. "men", "women", "kids").
        keyword (str): The keyword to search for in the product description(e.g. "shirt", "jeans", "jacket").
        min_price (int): The minimum price of the product.
        max_price (int): The maximum price of the product.(e.g. 2000 means under ₹2000)

        returns:
            A short confirmation message (e.g. "here are men's shirts under ₹2000")
    """

    query: Dict[str, Any] = {}

    if category:
        query["category"] = {"$regex": f"^{category.strip()}$", "$options": "i"}

    if keyword:
       query["name"] = {"$regex": f"^{keyword.strip()}$", "$options": "i"}

       #build price filter
       price_filter : Dict[str, Any] = {}
       if max_price is not None:
           price_filter["$lte"] = max_price
       if min_price is not None:
           price_filter["$gte"] = min_price
       if price_filter:
           query["price"] = price_filter

       raw_results = list(products_collection.find(query).limit(8))

       processed = []

       for r in raw_results:
           r["id"] = str(r["_id"])
           r.pop("_id", None)
           r.pop("image_data",None)
           r.pop("image_content_type", None)
           processed.append(r)

       ctx.deps.found_products = processed

       if not processed:
           return "No products found for this filter."
       return f"Found {len(processed)} product(s) for this filter."


@router.post("")
async def chat_bot(data:dict = Body(...)):
    """
        Main chat endpoint. Accepts a user message and returns either a plain text reply or a list of mathching products.
    """

    user_message = data.get("message", "").strip()
    if not user_message:
        return {"type" : "text", "message" : "Please enter a message.", "data": None}

    deps = StoreDeps()

    try:
        result = await agent.run(user_message, deps=deps)
        text_reply = result.output # plain string from llm

        #if tool was called and found products -> send them to the frontend
        if deps.found_products:
            return {
                "type": "products",
                "message": text_reply,
                "data": deps.found_products
            }

        #otherwise just a normal conversation reply
        return {
            "type": "text",
            "message": text_reply,
            "data": None,
        }

    except Exception as e:
        print(f"[Chatbot Error]: {e}")
        return {
            "type": "text",
            "message": "Sorry, I can't help with that. For assistance, contact our customer care at 546464434.",
            "data": None
        }
