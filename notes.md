
// // Image processing logic
// fs.readdir(inputFolder, (err, files) => {
//   if (err) {
//     console.error(err);
//     return;
//   }

//   files.forEach((file) => {
//     if (
//       file.endsWith(".jpg") ||
//       file.endsWith(".jpeg") ||
//       file.endsWith(".png")
//     ) {
//       const inputPath = `${inputFolder}/${file}`;
//       const name = file.substring(0, file.lastIndexOf("."));

//       formats.forEach((format) => {
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