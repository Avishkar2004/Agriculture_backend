import { db } from "../config/db.js";  // Make sure the import is correct

// Function to insert a new delivery address
export const insertDeliveryAddress = (address, userId, callback) => {
  const query = `
    INSERT INTO delivery_addresses (
      user_id, phone_number, alternate_phone_number, pincode, 
      locality, street_address, city, state, landmark, address_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    userId, 
    address.name, 
    address.phoneNumber, 
    address.alternatePhoneNumber, 
    address.pincode,
    address.locality, 
    address.streetAddress, 
    address.city, 
    address.state, 
    address.landmark, 
    address.addressType
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("Error inserting address:", err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};
