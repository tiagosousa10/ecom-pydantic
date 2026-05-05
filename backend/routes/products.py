"""
Product management routes including addiittion, retrieval, updating, and deleting products.

"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from ..models import Product
from ..database import products_collection

import base64
from io import BytesIO
from bson import ObjectId

from PIL import Image


router = APIRouter(prefix="/products", tags=["Products"])

# MongoDB BSON docs are capped at ~16MB; base64 expands payload ~4/3.
_MAX_BASE64_IMAGE_CHARS = 11_000_000


def _prepare_image_for_mongodb(image_bytes: bytes) -> tuple[str, str]:
    """Resize and JPEG-compress so the product document stays under MongoDB's size limit."""
    try:
        im = Image.open(BytesIO(image_bytes))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    if im.mode in ("RGBA", "LA"):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    elif im.mode != "RGB":
        im = im.convert("RGB")

    max_dim = 2048
    qualities = (88, 80, 72, 64, 56, 48, 40)

    for _ in range(12):
        scaled = im.copy()
        scaled.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        for quality in qualities:
            buf = BytesIO()
            scaled.save(buf, format="JPEG", quality=quality, optimize=True)
            b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
            if len(b64) <= _MAX_BASE64_IMAGE_CHARS:
                return b64, "image/jpeg"
        max_dim = max(400, int(max_dim * 0.72))

    raise HTTPException(
        status_code=413,
        detail="Image remains too large for storage after compression; try a smaller file.",
    )


@router.post("")
async def add_product(
    name: str = Form(...),
    description: str = Form(...),
    price: int = Form(...),
    category: str = Form(...),
    size: list[str] = Form(...),
    color: list[str] = Form(...),
    image: UploadFile = File(...),

):
    """ Add a new product to the database
    The image is stored as base64 in the database.
    """

    image_data = await image.read()
    base64_image, content_type = _prepare_image_for_mongodb(image_data)

    #create product document and insert into database
    product = {
        "name": name,
        "description": description,
        "price": price,
        "category": category,
        "size": size,
        "color": color,
        "image_data": base64_image,
        "image_content_type": content_type
    }

    products_collection.insert_one(product)
    return {"message": "Product added successfully"}



@router.get("")
async def get_products(
    category: str = "",
    min_price: int = None,
    max_price: int = None
):
    """ Get products filtered by category and/or price range """
    products = []
    query = {"category": {"$regex": f"^{category}$","$options": "i"}} if category else {}

    #apply price range filter
    if min_price is not None or max_price is not None:
        price_query = {}
        if max_price is not None:
            price_query["$lte"] = max_price
        if min_price is not None:
            price_query["$gte"] = min_price
        query["price"] = price_query


    for product in products_collection.find(query):
        product["id"] = str(product["_id"])
        product.pop("_id", None)

        if "inStock" not in product:
            product["inStock"] = True
        if "rating" not in product:
            product["rating"] = 4.5
        if "reviews" not in product:
            product["reviews"] = 0

        if "image" in product and product["image"] and not isinstance(product["image"], str) is False:
            if product["image"].startswith("http"):
                pass
            elif "image_data" in product and "image_content_type" in product:
                product["image"] = (
                    f"data:{product['image_content_type']};base64,{product['image_data']}"
                )
        elif "image_data" in product and "image_content_type" in product:
            product["image"] = (
                f"data:{product['image_content_type']};base64,{product['image_data']}"
            )

        product.pop("image_data", None)
        product.pop("image_content_type", None)

        products.append(product)
    return products


@router.delete("")
def delete_all_products():
    """ Delete all products from the database """
    result = products_collection.delete_many({})
    return {"message": f"Deleted {result.deleted_count} products"}


@router.post("/bulk-generate-500")
def bulk_generate_500():
    """ Bulk generate 500 products
    Generate 500 products for each category (men, women, kids)
    Items are consistent and keyword-searchable(e.g "classic blue jeans")
    Each category gets ~166 products cycling through real clothing item types.
    Images come from loremflickr.com using category-specific fashion keywords.
    """

    import random

    adjectives = ["Classic", "Modern", "Trendy", "Elegant", "Stylish", "Fashionable", "Trendy", "Elegant", "Stylish", "Fashionable"]
    colors = ["Black", "White", "Gray", "Brown", "Red", "Blue", "Green", "Yellow", "Purple", "Pink"]

    categories = [
        {
            "name": "men",
            "items": ["Shirt", "T-Shirt", "Jeans", "Chinos", "Blazer", "Jacket", "Polo", "Sweater", "Hoodie", "Shorts"],
            "keywords": ["menswear", "formal", "casual", "workwear", "streetwear", "athleisure", "smart casual", "business casual", "sportswear", "loungewear"]
        },
        {
            "name": "women",
            "items": ["Dress", "Kurti", "Saree", "Lehenga", "Blouse", "Top", "Skirt", "Palazzo", "Jumpsuit", "Cardigan"],
            "keywords": ["womenswear", "formal", "casual", "workwear", "streetwear", "athleisure", "smart casual", "business casual", "sportswear", "loungewear"]
        },
        {
            "name": "kids",
            "items": ["T-Shirt", "Frock", "Dungaree", "Shorts", "Jacket", "Pajama", "Romper", "Hoodie", "Sweater", "Shirt"],
            "keywords": ["kidswear", "formal", "casual", "workwear", "streetwear", "athleisure", "smart casual", "business casual", "sportswear", "loungewear"]
        }
    ]

    descriptions = [
        "A conforming piece of clothing that is suitable for the occasion.",
        "Premium quality fabric and construction.",
        "Designed for comfort and durability.",
        "Perfect for any occasion.",
        "Highly recommended for any occasion.",
        "Perfect for any occasion.",
        "A piece of clothing that is suitable for the occasion.",
        "Expertly crafted for elegance and durability.",
    ]

    sizes_pool = ["S", "M", "L", "XL", "XXL"]
    products = []

    for  i in range(500):
        cat = categories[i % 3]
        item = cat["items"][i % len(cat["items"])]
        adj = adjectives[i % len(adjectives)]
        color = colors[i % len(colors)]
        keyword = cat["keywords"][i % len(cat["keywords"])]
        seed = 1000 + i

        products.append({
            "name": f"{adj} {color} {item}",
            "description": descriptions[i % len(descriptions)],
            "price": random.randint(299, 7999),
            "category": cat["name"],
            "size": random.sample(sizes_pool, random.randint(2, 4)),
            "color": [color],
            "image": f"https://loremflickr.com/400/500/{keyword}?lock={seed}",
            "inStock": True,
            "rating": round(random.uniform(3.5, 5.0), 1),
            "reviews": random.randint(5, 300),

        })
    products_collection.insert_many(products)
    return {"message": f"Added {len(products)} products"}


@router.post("/bulk")
def add_multiple_products(products_list: list[Product]):
    """ Add multiple products to the database """
    products_list = [product.model_dump() if hasattr(product, 'model_dump') else product.dict() for product in products_list]
    products_collection.insert_many(products_list)
    return {"message": f"Added {len(products_list)} products"}


@router.delete("/{id}")
def delete_product(id:str):
    """ Delete a product from the database """
    try:
        result = products_collection.delete_one({"_id": ObjectId(id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": f"Product {id} deleted successfully"}


@router.put("/{id}")
async def update_product(
    id:str,
    name:str = Form(None),
    description:str = Form(None),
    price:int = Form(None),
    category:str = Form(None),
    size:str = Form(None),
    color:str = Form(None),
    image:UploadFile = File(None),
):
    """ Update a product in the database """
    try:
        # Build update dictionary
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description
        if price is not None:
            update_data["price"] = price
        if category is not None:
            update_data["category"] = category
        if size is not None:
            update_data["size"] = size.split(',')
        if color is not None:
            update_data["color"] = color.split(',')

        if image is not None:
            image_data = await image.read()
            base64_image, content_type = _prepare_image_for_mongodb(image_data)
            update_data["image_data"] = base64_image
            update_data["image_content_type"] = content_type

        result = products_collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})

    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": f"Product {id} updated successfully"}
