import { insertDeliveryAddress } from "../models/deliveryAddressModel.js"; // Use .js for ES module imports

export const addDeliveryAddress = (req, res) => {
  const {
    name,
    phoneNumber,
    pincode,
    locality,
    streetAddress,
    city,
    state,
    alternatePhoneNumber,
    landmark,
    addressType,
  } = req.body;
  const userId = req.user.id;

  console.log("Addresses", req.body);

  if (
    !name ||
    !phoneNumber ||
    !pincode ||
    !locality ||
    !streetAddress ||
    !city ||
    !state
  ) {
    return res.status(400).json({
      message:
        "All Fields are required except landmark and alternate phone number",
    });
  }

  const address = {
    name,
    phoneNumber,
    pincode,
    locality,
    streetAddress,
    city,
    state,
    alternatePhoneNumber,
    landmark,
    addressType,
  };

  // Call the model function to insert the address
  insertDeliveryAddress(address, userId, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error saving address", error: err });
    }
    return res
      .status(200)
      .json({ message: "Address saved successfully", data: result });
  });
};
