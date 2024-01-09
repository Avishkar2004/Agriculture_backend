import { v4 as uuidv4 } from "uuid";
import fs from "fs"; // Add this line
import path from "path";
const p = path.join(__dirname, "../data/dataInfo.mjs");

// Import the object name
import { products } from "../data/dataInfo.mjs"; // Replace with the correct path

// Export the products array
exports.products = products.map((product) => ({
  // Update properties based on your new data model
  name: product.name,
  description: product.description,
  salePrice: product.salePrice,
  reviews: product.reviews,
  stockStatus: product.stockStatus,
  image: product.image,
  to: product.to,
}));

const getProductsFromFile = (cb) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

class Products {
  constructor(
    id,
    name,
    description,
    salePrice,
    reviews,
    stockStatus,
    image,
    to
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.salePrice = salePrice;
    this.reviews = reviews;
    this.stockStatus = stockStatus;
    this.image = image;
    this.to = to;
  }

  save() {
    getProductsFromFile((products) => {
      this.id = String(uuidv4());
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.find((p) => p.id === id);
      cb(product);
    });
  }
}

module.exports = Products;
