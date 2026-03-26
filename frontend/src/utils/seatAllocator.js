export const allocateSeats = (passengerList, totalSeats = 180) => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    const rows = Math.ceil(totalSeats / 6);
    let seatPool = [];

    for (let r = 1; r <= rows; r++) {
        letters.forEach(l => seatPool.push(`${r}${l}`));
    }

    // Shuffle
    for (let i = seatPool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [seatPool[i], seatPool[j]] = [seatPool[j], seatPool[i]];
    }

    return passengerList.map((p, index) => ({
        ...p, // 🛰️ This grabs EVERYTHING from Excel (Dest, Time, etc.)
        name: p.Name || p.name || "UNKNOWN_ENTITY",
        seat: seatPool[index] || "STNDBY",
        gate: p.Gate || `G-${Math.floor(Math.random() * 12) + 1}`,
        boardingTime: p.Time || p.time || "18:45"
    }));
};