import {
  insertDeliveryAddress,
  getDeliveryAddressesByUserId,
} from "../models/deliveryAddressModel.js"; // Use .js for ES module imports

export const addDeliveryAddress = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized: User not found" });
  }

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
  const userId = req.user.id; // Assume middleware sets `req.user`

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

export const fetchDeliveryAddresses = (req, res) => {
  const userId = req.user.id;
  getDeliveryAddressesByUserId(userId, (err, addresses) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Failed to fetch delivery addresses" });
    }
    res.json(addresses);
  });
};
