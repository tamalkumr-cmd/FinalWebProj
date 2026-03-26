import { useState } from 'react';

export const useLoadmaster = (initialCapacity = 180) => {
    // Generate empty seats
    const [seats, setSeats] = useState(
        Array.from({ length: initialCapacity }, (_, i) => ({
            id: i + 1,
            class: i < 20 ? 'BUSINESS' : 'ECONOMY',
            status: 'AVAILABLE'
        }))
    );

    const [crew, setCrew] = useState([
        { id: 1, role: 'PILOT_IN_COMMAND', name: '', status: 'UNASSIGNED' },
        { id: 2, role: 'CO_PILOT', name: '', status: 'UNASSIGNED' },
        { id: 3, role: 'LEAD_PURSER', name: '', status: 'UNASSIGNED' },
        { id: 4, role: 'LOADMASTER', name: '', status: 'UNASSIGNED' }
    ]);

    return { seats, setSeats, crew, setCrew };
};