// TripPage.tsx
import React, { use, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User } from './App';

interface TripDetails {
    busCapacity: number;
    tripDate: string;
    busList: Array<{ name: string; email: string; checkIn: string }>;
    waitList: Array<{ name: string; email: string; checkIn: string }>;
}

interface TripPageProps {
    user: User;
}

console.log("VITE_REACT_APP_GOOGLE_APPS_SCRIPT_URL: ", import.meta.env.VITE_REACT_APP_GOOGLE_APPS_SCRIPT_URL);

const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_REACT_APP_GOOGLE_APPS_SCRIPT_URL || "";

const TripPage: React.FC<TripPageProps> = ({ user }) => {
    const { tripName } = useParams<{ tripName: string }>();
    const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    const fetchTripDetails = async () => {
        setLoading(true);

        try {
            console.log("Fetching trip details for: ", tripName);
            console.log(JSON.stringify({ action: 'getTripDetails', tripName }));


            const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}` // Add OAuth token
                },
                body: JSON.stringify({ action: 'getTripDetails', tripName }),
            });

            const data = await res.json();

            if (data.error) {
                setMessage(data.error);
            } else {
                setTripDetails(data);
            }
        } catch (err) {
            setMessage("Error fetching trip details.");
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchTripDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripName]);

    // Returns true if the user appears in either the bus list or waitlist.
    const isUserRegistered = (): boolean => {
        if (!tripDetails) return false;
        const inBus = tripDetails.busList.find(
            (entry) => entry.email.toLowerCase() === user.email.toLowerCase()
        );
        const inWait = tripDetails.waitList.find(
            (entry) => entry.email.toLowerCase() === user.email.toLowerCase()
        );
        return Boolean(inBus || inWait);
    };

    const getUserStatus = (): string => {
        if (!tripDetails) return '';
        const inBus = tripDetails.busList.find(
            (entry) => entry.email.toLowerCase() === user.email.toLowerCase()
        );
        if (inBus) {
            return "You are on the bus list." + (inBus.checkIn === "Checked In" ? " (Checked In)" : "");
        }
        const waitIndex = tripDetails.waitList.findIndex(
            (entry) => entry.email.toLowerCase() === user.email.toLowerCase()
        );
        if (waitIndex !== -1) {
            return `You are on the waitlist at position ${waitIndex + 1}.` +
                (tripDetails.waitList[waitIndex].checkIn === "Checked In" ? " (Checked In)" : "");
        }
        return '';
    };

    const register = async () => {
        try {



            const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}` // Add OAuth token
                },
                body: JSON.stringify({ action: 'register', tripName, userName: user.name }),
            });

            const data = await res.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage("Registered successfully!");
                fetchTripDetails();
            }
        } catch (err) {
            setMessage("Error during registration.");
        }
    };

    const checkIn = async () => {
        if (!window.confirm("Are you sure you want to check in?")) return;
        try {

   

            const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}` // Add OAuth token
                },
                body: JSON.stringify({ action: 'checkIn', tripName }),
            });

            const data = await res.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage("Checked in successfully!");
                fetchTripDetails();
            }
        } catch (err) {
            setMessage("Error during check-in.");
        }
    };

    const removeRegistration = async () => {
        if (!window.confirm("Are you sure you want to remove your registration?")) return;
        try {


            const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}` // Add OAuth token
                },
                body: JSON.stringify({ action: 'remove', tripName }),
            });

            const data = await res.json();
            if (data.error) {
                setMessage(data.error);
            } else {
                setMessage("Removed successfully!");
                fetchTripDetails();
            }
        } catch (err) {
            setMessage("Error during removal.");
        }
    };

    // Check if today is exactly two days before the trip date.
    const canCheckIn = (): boolean => {
        if (!tripDetails || !isUserRegistered()) return false;
        const tripDate = new Date(tripDetails.tripDate);
        const twoDaysBefore = new Date(tripDate);
        twoDaysBefore.setDate(tripDate.getDate() - 2);
        const today = new Date();
        return today.toDateString() === twoDaysBefore.toDateString();
    };

    return (
        <div>
            <h1>Trip: {tripName}</h1>
            {loading && <p>Loading trip details...</p>}
            {message && <p>{message}</p>}
            {tripDetails && (
                <>
                    <p>Trip Date: {new Date(tripDetails.tripDate).toLocaleDateString()}</p>
                    <p>Bus Capacity: {tripDetails.busCapacity}</p>
                    <p>{getUserStatus()}</p>
                    {!isUserRegistered() && (
                        <button onClick={register}>Register</button>
                    )}
                    {isUserRegistered() && (
                        <>
                            <button onClick={checkIn} disabled={!canCheckIn()}>
                                Check In
                            </button>
                            <button onClick={removeRegistration}>Remove Me</button>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default TripPage;
