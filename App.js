// app.js
import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import sharp from 'sharp';

const app = express();
const port = 8080;

const inputFolder = 'images';
const outputFolder = 'output';

const formats = ['avif', 'webp'];

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Data and Products class
const p = path.join(new URL('.', import.meta.url).pathname, "data", "dataInfo.cjs");

class Products {
  constructor(
    name,
    description,
    salePrice,
    reviews,
    stockStatus,
    image,
    to
  ) {
    this.id = null;
    this.name = name;
    this.description = description;
    this.salePrice = salePrice;
    this.reviews = reviews;
    this.stockStatus = stockStatus;
    this.image = image;
    this.to = to;
  }

  save(existingProducts) {
    this.id = String(uuidv4());
    existingProducts.push(this);
    fs.writeFile(p, JSON.stringify(existingProducts), (err) => {
      console.log(err);
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

const getProductsFromFile = (cb) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

const productsInstance = new Products();

// Admin Controller
const adminController = {
  getIndex: (req, res) => {
    res.send("Product Home Route");
  },
  getProducts: (req, res) => {
    Products.fetchAll((products) => {
      console.log(products);
      res.json(products);
    });
  },
  getProduct: (req, res) => {
    const productId = req.params.productId;
    Products.findById(productId, (product) => {
      console.log(product);
      res.json(product);
    });
  },
  postAddProduct: (req, res) => {
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
  },
};

// Admin Route
const adminRoute = express.Router();

adminRoute.get("/", adminController.getIndex);
adminRoute.get("/products", adminController.getProducts);
adminRoute.get("/products/:productId", adminController.getProduct);
adminRoute.post("/add-product", adminController.postAddProduct);

app.use("/", adminRoute);

// Image processing logic
fs.readdir(inputFolder, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  files.forEach(file => {
    if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
      const inputPath = `${inputFolder}/${file}`;
      const name = file.substring(0, file.lastIndexOf('.'));

      formats.forEach(format => {
        const outputPath = `${outputFolder}/${name}.${format}`;

        if (!fs.existsSync(outputPath)) {
          sharp(inputPath)
            .toFormat(format, { quality: 80 })
            .toFile(outputPath, (err) => {
              if (err) {
                console.error(err);
              } else {
                console.log(`${name}.${format} saved`);
              }
            });
        }
      });
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () =>
  console.log(`Server running on port ${port}, http://localhost:${port}`)
);
