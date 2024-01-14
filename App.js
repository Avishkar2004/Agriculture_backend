import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import mysql2 from "mysql2";
import sharp from "sharp";

const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "agrisite",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

const app = express();
const port = 8080;

const outputFolder = "output";

if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

class Products {
  constructor(name, description, salePrice, reviews, stockStatus, image, to) {
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
    fs.writeFile("data.json", JSON.stringify(existingProducts), (err) => {
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
  fs.readFile("data.json", (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

fs.readdir("images", (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  files.forEach((file) => {
    const formats = ["avif", "bin"];
    if (
      file.endsWith(".jpg") ||
      file.endsWith(".jpeg") ||
      file.endsWith(".png") ||
      file.endsWith(".avif") ||
      file.endsWith(".jpg") ||
      file.endsWith(".webp")
    ) {
      const inputPath = `images/${file}`;
      const name = file.substring(0, file.lastIndexOf("."));

      formats.forEach((format) => {
        const outputPath = `output/${name}.${format}`;

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

const adminController = {
  getIndex: (req, res) => {
    res.send("Product Home Route");
  },

  getProducts: (req, res) => {
    Products.fetchAll((products) => {
      res.json(products);
    });
  },

  getProduct: (req, res) => {
    const productId = req.params.productId;
    Products.findById(productId, (product) => {
      res.json(product);
    });
  },

  postAddProduct: (req, res) => {
    const { name, description, salePrice, reviews, stockStatus, image, to } =
      req.body;
    const product = new Products(
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

app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const productWithBase64Images = result.map((product) => {
      const base64Image = Buffer.from(product.image, "binary").toString(
        "base64"
      );
      const base64HdImage = Buffer.from(product.hd_image, "binary").toString(
        "base64"
      );

      return { ...product, image: base64Image, hd_image: base64HdImage };
    });
    res.json(productWithBase64Images);
  });
});

// This is for plant Growth Regulator
app.get("/plantgrowthregulator", (req, res) => {
  db.query("SELECT * FROM plantgrowthregulator", (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const productWithBase64PGRImages = result.map((plantgrowthregulator) => {
      const base64PGRImage = Buffer.from(
        plantgrowthregulator.image,
        "binary"
      ).toString("base64");
      const base64HdImagePGR = Buffer.from(
        plantgrowthregulator.hd_image,
        "binary"
      ).toString("base64");

      return {
        ...plantgrowthregulator,
        image: base64PGRImage,
        hd_image: base64HdImagePGR,
      };
    });
    res.json(productWithBase64PGRImages);
  });
});

// This is for Organic Product
app.get("/organicproduct", (req, res) => {
  db.query("SELECT * FROM organicproduct", (err, result) => {
    if (err) {
      console.err(err);
      res
        .status(500)
        .json({ error: "Internal server error in Organicproduct" });
      return;
    }

    const baseWithBase64Organic = result.map((organicproduct) => {
      const base64Organic = Buffer.from(
        organicproduct.image,
        "binary"
      ).toString("base64");
      return { ...organicproduct, image: base64Organic };
    });

    res.send(baseWithBase64Organic);
  });
});

// This is for cart
app.get("/cart", (req, res) => {
  db.query("SELECT * FROM cart", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error in Cart" });
      return;
    }

    try {
      const baseWithCart = results.map((cart) => {
        // Check if the 'image' field exists before converting it to a Buffer
        const baseCartPhoto = cart.image
          ? Buffer.from(cart.image, "binary").toString("base64")
          : null;

        return { ...cart, image: baseCartPhoto };
      });

      res.send(baseWithCart);
    } catch (error) {
      console.error("Error processing cart data:", error);
      res.status(500).json({ error: "Internal server error in Cart" });
    }
  });
});


const adminRoute = express.Router();

adminRoute.get("/", adminController.getIndex);
adminRoute.get("/products", adminController.getProducts);
adminRoute.get("/products/:productId", adminController.getProduct);
adminRoute.post("/add-product", adminController.postAddProduct);

app.use("/", adminRoute);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(port, () =>
  console.log(`Server running on port ${port}, http://localhost:${port}`)
);
