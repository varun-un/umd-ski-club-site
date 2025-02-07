// HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from './App';

interface HomePageProps {
  user: User;
}

const trips = [
  { name: 'SkiTrip_Feb2025' },
  { name: 'SkiTrip_Mar2025' },
  { name: 'SkiTrip_Apr2025' },
  { name: 'SkiTrip_May2025' },
];

const HomePage: React.FC<HomePageProps> = ({ user }) => {
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <h2>Available Trips</h2>
      <ul>
        {trips.map((trip) => (
          <li key={trip.name}>
            <Link to={`/trip/${trip.name}`}>{trip.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
