import { db } from "../config/db.js"; // Make sure the import is correct

// Function to insert a new delivery address
export const insertDeliveryAddress = (address, userId, callback) => {
  const query = `
    INSERT INTO delivery_addresses (
      user_id, name, phone_number, pincode, locality, street_address, city, state, alternate_phone_number, landmark, address_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    userId,
    address.name,
    address.phoneNumber,
    address.pincode,
    address.locality,
    address.streetAddress,
    address.city,
    address.state,
    address.alternate_phone_number,
    address.landmark,
    address.addressType,
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

// Function to fetch delivery addresses for a specific user
export const getDeliveryAddressesByUserId = (userId, callback) => {
  const query = `
SELECT 
      id, user_id, phone_number, alternate_phone_number, pincode, 
      locality, street_address, city, state, landmark, address_type
    FROM delivery_addresses
    WHERE user_id = ?
`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching delivery addresses", err);
      callback(err, null);
    } else {
      callback(null, results);
    }
  });
};
