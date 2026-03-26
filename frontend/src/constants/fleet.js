// src/constants/fleet.js

export const FLEET_MODELS = {
    BOEING: [
        { model: "737-MAX 8", engine: "CFM LEAP-1B", cap: 189, type: "Narrow-Body", burnRate: 2.2 },
        { model: "787-9 Dreamliner", engine: "GEnx-1B", cap: 296, type: "Wide-Body", burnRate: 5.4 },
        { model: "777-300ER", engine: "GE90-115B", cap: 396, type: "Long-Haul", burnRate: 7.8 }
    ],
    AIRBUS: [
        { model: "A320neo", engine: "LEAP-1A", cap: 180, type: "Narrow-Body", burnRate: 2.1 },
        { model: "A350-1000", engine: "Trent XWB-97", cap: 350, type: "Wide-Body", burnRate: 6.1 },
        { model: "A380-800", engine: "GP7200", cap: 525, type: "Super-Jumbo", burnRate: 12.5 }
    ]
};

// Alias to prevent import errors
export const FLEET_ASSETS = FLEET_MODELS;

export const AIRLINE_LOGOS = [
    { name: "SKY_LINK_INTL", url: "https://logo.clearbit.com/emirates.com" },
    { name: "VECTOR_CARGO", url: "https://logo.clearbit.com/fedex.com" },
    { name: "INDIGO_GLOBAL", url: "https://logo.clearbit.com/goindigo.in" },
    { name: "QUANTUM_AIR", url: "https://logo.clearbit.com/qantas.com" }
];