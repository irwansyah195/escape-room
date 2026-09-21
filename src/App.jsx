import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GamePage from './pages/GamePage';
import DosenPage from './pages/DosenPage';
import { getRoomsFromDb } from './firebase/config';
import { defaultRooms } from './data/defaultRooms';

export default function App() {
  const [rooms, setRooms] = useState(defaultRooms);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Ambil data ruangan & soal dari Firestore / cache saat aplikasi dibuka
  useEffect(() => {
    async function loadRooms() {
      try {
        const fetchedRooms = await getRoomsFromDb();
        if (fetchedRooms && fetchedRooms.length > 0) {
          setRooms(fetchedRooms);
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
      } finally {
        setLoadingRooms(false);
      }
    }
    loadRooms();
  }, []);

  // Handler saat Dosen mengupdate soal/ruangan
  const handleUpdateRooms = (newRooms) => {
    setRooms(newRooms);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <GamePage
              rooms={rooms}
              loadingRooms={loadingRooms}
            />
          }
        />
        <Route
          path="/dosen"
          element={
            <DosenPage
              rooms={rooms}
              onUpdateRooms={handleUpdateRooms}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
