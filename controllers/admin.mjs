// // controllers/admin.js
// import { products } from "../models/Data.js"; // Updated import statement

// import sharp from 'sharp';
// import fs from 'fs';

// const inputFolder = 'images';
// const outputFolder = 'output';

// const formats = ['avif', 'webp'];

// if (!fs.existsSync(outputFolder)) {
//   fs.mkdirSync(outputFolder);
// }

// fs.readdir(inputFolder, (err, files) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//   files.forEach(file => {
//     if (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')) {
//       const inputPath = `${inputFolder}/${file}`;
//       const name = file.substring(0, file.lastIndexOf('.'));

//       formats.forEach(format => {
//         const outputPath = `${outputFolder}/${name}.${format}`;

//         if (!fs.existsSync(outputPath)) {
//           sharp(inputPath)
//             .toFormat(format, { quality: 80 })
//             .toFile(outputPath, (err) => {
//               if (err) {
//                 console.error(err);
//               } else {
//                 console.log(`${name}.${format} saved`);
//               }
//             });
//         }
//       });
//     }
//   });
// });
// exports.getIndex = (req, res) => {
//   res.send("Product Library Home Route");
// };

// exports.getProducts = (req, res) => {
//   Products.fetchAll((products) => {
//     console.log(products);
//     res.json(products);
//   });
// };

// exports.getProduct = (req, res) => {
//   const productId = req.params.productId;
//   Products.findById(productId, (product) => {
//     console.log(product);
//     res.json(product);
//   });
// };

// exports.postAddProduct = (req, res) => {
//   const { name, description, salePrice, reviews, stockStatus, image, to } =
//     req.body;
//   const product = new Products(
//     null,
//     name,
//     description,
//     salePrice,
//     reviews,
//     stockStatus,
//     image,
//     to
//   );
//   product.save();
//   res.json({ msg: "Product Added" });
// };
