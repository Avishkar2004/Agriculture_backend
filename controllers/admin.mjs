// controllers/admin.js
import Products from "../models/Data.js";

exports.getIndex = (req, res) => {
  res.send("Product Library Home Route");
};

exports.getProducts = (req, res) => {
  Products.fetchAll((products) => {
    console.log(products);
    res.json(products);
  });
};

exports.getProduct = (req, res) => {
  const productId = req.params.productId;
  Products.findById(productId, (product) => {
    console.log(product);
    res.json(product);
  });
};

exports.postAddProduct = (req, res) => {
  const { name, description, salePrice, reviews, stockStatus, image, to } =
    req.body;
  const product = new Products(
    null,
    name,
    description,
    salePrice,
    reviews,
    stockStatus,
    image,
    to
  );
  product.save();
  res.json({ msg: "Product Added" });
};
