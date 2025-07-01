import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";
import { Sequelize } from "sequelize";

export const getAllProducts = async (req, res) => {
  try {
    const where = {};
    let order = [["createdAt", "ASC"]];

    if (req.query.search) {
      where.name = {
        [Sequelize.Op.iLike]: `%${req.query.search}%`,
      };
    }

    if (req.query.category) {
      where.category = req.query.category;
    }

    if (req.query.minPrice) {
      where.price = {
        ...where.price,
        [Sequelize.Op.gte]: parseFloat(req.query.minPrice),
      };
    }
    if (req.query.maxPrice) {
      where.price = {
        ...where.price,
        [Sequelize.Op.lte]: parseFloat(req.query.maxPrice),
      };
    }

    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case "priceAsc":
          order = [["price", "ASC"]];
          break;
        case "priceDesc":
          order = [["price", "DESC"]];
          break;
        case "newest":
          order = [["createdAt", "DESC"]];
          break;
        case "oldest":
          order = [["createdAt", "ASC"]];
          break;
        default:
          order = [["createdAt", "ASC"]];
      }
    }

    const products = await Product.findAll({
      where,
      order,
    });
    res.json({ products });
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product.toJSON());
  } catch (error) {
    console.error("Error in getProductsById controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProductsCache = await redis.get("featured_products");
    if (featuredProductsCache) {
      const parsedCache = JSON.parse(featuredProductsCache);
      if (Array.isArray(parsedCache)) {
        return res.json(parsedCache);
      } else {
        console.warn(
          "DEBUG: Featured products cache found but not an array, re-fetching from DB."
        );
      }
    }

    const featuredProducts = await Product.findAll({
      where: { isFeatured: true },
      order: [["createdAt", "DESC"]],
      limit: 8,
    });

    // if (!featuredProducts || featuredProducts.length === 0) {
    //   return res.status(200).json([]);
    // }

    const featuredProductsJson = featuredProducts.map((p) => p.toJSON());

    await redis.set("featured_products", JSON.stringify(featuredProductsJson));
    await redis.expire("featured_products", 3600);

    res.json(featuredProductsJson);
  } catch (error) {
    console.error("Error in getFeaturedProducts controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getNewProducts = async (req, res) => {
  try {
    const newProducts = await Product.findAll({
      order: [["createdAt", "DESC"]],
      limit: 8,
    });

    if (!newProducts || newProducts.length === 0) {
      console.log("DEBUG: No new products found. Returning empty array.");
      return res.status(200).json([]);
    }

    const newProductsJson = newProducts.map((p) => p.toJSON());
    console.log(
      "DEBUG: New products JSON (first item after map):",
      newProductsJson[0]
    );

    res.json(newProductsJson);
  } catch (error) {
    console.error("Error in getNewProducts controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      shortDescription,
      description,
      price,
      countInStock,
      image,
      category,
      color,
      size,
    } = req.body;

    let uploadedImages = [];

    if (Array.isArray(image)) {
      for (const img of image) {
        const uploaded = await cloudinary.uploader.upload(img, {
          folder: "products",
        });
        uploadedImages.push(uploaded.secure_url);
      }
    } else if (typeof image === "string") {
      const uploaded = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
      uploadedImages.push(uploaded.secure_url);
    }

    const product = await Product.create({
      name,
      shortDescription,
      description,
      price,
      countInStock,
      image: uploadedImages,
      category,
      color,
      size,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const {
    name,
    shortDescription,
    description,
    price,
    countInStock,
    image,
    category,
    color,
    size,
  } = req.body;

  try {
    const product = await Product.findByPk(req.params.id);
    console.log(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let updatedImages = [];

    if (Array.isArray(image)) {
      for (const img of image) {
        const uploaded = await cloudinary.uploader.upload(img, {
          folder: "products",
        });
        updatedImages.push(uploaded.secure_url);
      }
    } else if (typeof image === "string") {
      const uploaded = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
      updatedImages.push(uploaded.secure_url);
    }

    await product.update({
      name,
      shortDescription,
      description,
      price,
      countInStock,
      image: updatedImages,
      category,
      color,
      size,
    });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteImageProduct = async (req, res) => {
  const { id } = req.params;
  const { imageIndex } = req.body;

  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const images = [...product.image];
    images.splice(imageIndex, 1);
    product.image = images;

    await product.save();
    res.json({ message: "Image deleted", images });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image deleted from Cloudinary");
      } catch (error) {
        console.log("Error deleting image from Cloudinary", error.message);
      }
    }

    await product.destroy();

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: [
        "id",
        "name",
        "shortDescription",
        "description",
        "price",
        "countInStock",
        "image",
        "category",
        "color",
        "size",
      ],
      order: Sequelize.literal("RANDOM()"),
      limit: 8,
    });

    const productsJson = products.map((p) => p.toJSON());

    console.log(
      "DEBUG: Recommended products JSON (first item):",
      productsJson[0]
    );
    res.json(productsJson);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  const { category } = req.params;
  try {
    const products = await Product.findAll({ where: { category } });
    res.json({ products });
  } catch (error) {
    console.log("Error in getProductsByCategory controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.findAll({
      where: { isFeatured: true },
      order: [["createdAt", "DESC"]],
      limit: 8,
    });
    await redis.set(
      "featured_products",
      JSON.stringify(featuredProducts.map((p) => p.toJSON()))
    );
    await redis.expire("featured_products", 3600);
  } catch (error) {
    console.error("Error updating featured products cache:", error.message);
  }
}
