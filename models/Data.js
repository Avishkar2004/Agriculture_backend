// // Data.js
// import { v4 as uuidv4 } from "uuid";
// import fs from "fs";
// import path from "path";

// const p = path.join(__dirname, "../data/dataInfo.mjs");

// class Products {
//   constructor(
//     name,
//     description,
//     salePrice,
//     reviews,
//     stockStatus,
//     image,
//     to
//   ) {
//     this.id = null; // id is set later in the save method
//     this.name = name;
//     this.description = description;
//     this.salePrice = salePrice;
//     this.reviews = reviews;
//     this.stockStatus = stockStatus;
//     this.image = image;
//     this.to = to;
//   }

//   save(existingProducts) {
//     this.id = String(uuidv4());
//     existingProducts.push(this);
//     fs.writeFile(p, JSON.stringify(existingProducts), (err) => {
//       console.log(err);
//     });
//   }

//   static fetchAll(cb) {
//     getProductsFromFile(cb);
//   }

//   static findById(id, cb) {
//     getProductsFromFile((products) => {
//       const product = products.find((p) => p.id === id);
//       cb(product);
//     });
//   }
// }

// const getProductsFromFile = (cb) => {
//   fs.readFile(p, (err, fileContent) => {
//     if (err) {
//       cb([]);
//     } else {
//       cb(JSON.parse(fileContent));
//     }
//   });
// };

// const productsInstance = new Products();

// export { productsInstance as products };
