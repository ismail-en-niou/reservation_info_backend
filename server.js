const express = require('express');
const cors = require('cors');
const { getDatabase, ref, set, get, child, query, orderByChild, equalTo } = require('firebase/database');
const database = require('./firebaseConfig'); // Import the database

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const maxCapacity =0; // Maximum capacity of the club

// Route to get current reserved count
app.get('/reservations', async (req, res) => {
  try {
    const dbRef = ref(database, 'reservations');
    const snapshot = await get(dbRef);
    let reservedCount = 0;

    if (snapshot.exists()) {
      reservedCount = snapshot.size; // Count the number of reservations
    }

    const availableSpots = maxCapacity - reservedCount; // Calculate available spots
    // const availableSpots = 0;
    res.json({ reservedCount, availableSpots, maxCapacity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// Route to reserve a spot
app.post('/reserve', async (req, res) => {
  const { name, email, phone, sector, contactMethod, message, membershipPaid } = req.body; // Destructure user data to include membershipPaid
  const dbRef = ref(database, 'reservations');

  try {
    // Check if the email already exists in the database
    const emailQuery = query(dbRef, orderByChild('email'), equalTo(email));
    const existingReservationsSnapshot = await get(emailQuery);
    if (existingReservationsSnapshot.exists()) {
      return res.status(400).json({ message: 'Email already reserved a spot!' });
    }

    const snapshot = await get(dbRef);
    const reservedCount = snapshot.exists() ? snapshot.size : 0; // Get current reserved count

    if (reservedCount < maxCapacity) {
      // Save reservation to Firebase, including membershipPaid
      await set(ref(database, 'reservations/' + (reservedCount + 1)), {
        name,
        email,
        phone,
        sector, // Save the sector
        contactMethod,
        message,
        membershipPaid, // Include membershipPaid in the reservation data
      });
      console.log(`Reserved by: ${name}, Email: ${email}, Phone: ${phone}, Sector: ${sector}, Contact Method: ${contactMethod}, Message: ${message}, Membership Paid: ${membershipPaid}`); // Log user data
      res.status(200).json({ message: 'Spot reserved!', reservedCount: reservedCount + 1 });
    } else {
      res.status(400).json({ message: 'No more spots available!' });
    }
  } catch (error) {
    console.error('Error reserving spot:', error); // Log the error
    res.status(500).json({ message: 'Error reserving spot' });
  }
});

// Route to modify membership status
app.put('/modify-membership', async (req, res) => {
  const { email, membershipPaid } = req.body; // Destructure user data to include email and membershipPaid
  const dbRef = ref(database, 'reservations');

  try {
    // Check if the email exists in the database
    const emailQuery = query(dbRef, orderByChild('email'), equalTo(email));
    const existingReservationsSnapshot = await get(emailQuery);
    
    if (!existingReservationsSnapshot.exists()) {
      return res.status(404).json({ message: 'No reservation found for this email!' });
    }

    // Get the key of the existing reservation
    const reservationKey = Object.keys(existingReservationsSnapshot.val())[0];

    // Update the membershipPaid status
    await set(ref(database, 'reservations/' + reservationKey + '/membershipPaid'), membershipPaid);
    
    res.status(200).json({ message: 'Membership status updated successfully!' });
  } catch (error) {
    console.error('Error modifying membership status:', error); // Log the error
    res.status(500).json({ message: 'Error modifying membership status' });
  }
});

// Route to check if a user exists in the database
app.get('/check-user', async (req, res) => {
  const { email } = req.query; // Get the email from query parameters
  const dbRef = ref(database, 'reservations');

  try {
    // Check if the email exists in the database
    const emailQuery = query(dbRef, orderByChild('email'), equalTo(email));
    const existingReservationsSnapshot = await get(emailQuery);
    
    if (existingReservationsSnapshot.exists()) {
      const reservationData = existingReservationsSnapshot.val();
      const isPaid = reservationData.membershipPaid ? 'is paid' : 'is not paid';
      return res.status(200).json({ message: `User exists in the database and ${isPaid , reservationData}.` });
    } else {
      return res.status(404).json({ message: 'User not found in the database.' });
    }
  } catch (error) {
    console.error('Error checking user:', error); // Log the error
    res.status(500).json({ message: 'Error checking user' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
