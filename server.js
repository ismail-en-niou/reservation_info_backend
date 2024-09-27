const express = require('express');
const cors = require('cors');
const { getDatabase, ref, set, get, child, query, orderByChild, equalTo } = require('firebase/database');
const database = require('./firebaseConfig'); // Import the database

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const maxCapacity = 0; // Maximum capacity of the club

// Route to get current reserved count
app.get('/reservations', async (req, res) => {
  try {
    const dbRef = ref(database, 'reservations');
    const snapshot = await get(dbRef);
    let reservedCount = 0;

    if (snapshot.exists()) {
      reservedCount = snapshot.size; // Count the number of reservations
    }

    // const availableSpots = maxCapacity - reservedCount; // Calculate available spots
    const availableSpots = 0;
    res.json({ reservedCount, availableSpots, maxCapacity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// Route to reserve a spot
app.post('/reserve', async (req, res) => {
  const { name, email, phone, sector, contactMethod, message } = req.body; // Destructure user data
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
      // Save reservation to Firebase
      await set(ref(database, 'reservations/' + (reservedCount + 1)), {
        name,
        email,
        phone,
        sector, // Save the sector
        contactMethod,
        message,
      });
      console.log(`Reserved by: ${name}, Email: ${email}, Phone: ${phone}, Sector: ${sector}, Contact Method: ${contactMethod}, Message: ${message}`); // Log user data
      res.status(200).json({ message: 'Spot reserved!', reservedCount: reservedCount + 1 });
    } else {
      res.status(400).json({ message: 'No more spots available!' });
    }
  } catch (error) {
    console.error('Error reserving spot:', error); // Log the error
    res.status(500).json({ message: 'Error reserving spot' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});