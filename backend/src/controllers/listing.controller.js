import { PrismaClient } from "@prisma/client";
import axios from 'axios';

const prisma = new PrismaClient();
const WEATHER_API_KEY = process.env.OPENWEATHER_KEY;
const CRUISE_SPEED_KMH = 850;

// --- 🌏 GEOSPATIAL ENGINE ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// ==========================================
// 🚀 CREATE FLIGHT (SIMULATION LOADOUT)
// ==========================================
export const createListing = async(req, res) => {
    try {
        const {
            airline,
            manufacturer,
            aircraftModel,
            engineType,
            vesselType,
            fuelLoad,
            source,
            destination,
            sourceLat,
            sourceLng,
            destLat,
            destLng,
            departure,
            seatsCount,
            pilotName,
            pilotBio,
            operatorLogo,
            price
        } = req.body;

        const sellerId = req.user.id;

        if (!airline || !sourceLat || !destLat || !departure) {
            return res.status(400).json({ error: "CRITICAL: Missing Mission Parameters" });
        }

        const sLat = parseFloat(sourceLat);
        const sLng = parseFloat(sourceLng);
        const dLat = parseFloat(destLat);
        const dLng = parseFloat(destLng);

        const distance = calculateDistance(sLat, sLng, dLat, dLng);
        const durationHours = distance / CRUISE_SPEED_KMH;
        const arrivalDate = new Date(new Date(departure).getTime() + (durationHours * 3600000));

        const imageUrl = req.file ? req.file.path : null;

        const newFlight = await prisma.listing.create({
            data: {
                airline,
                manufacturer: manufacturer || "BOEING",
                aircraftModel: aircraftModel || "B737-MAX",
                engineType: engineType || "CFM LEAP-1B",
                vesselType: vesselType || "PASSENGER",
                fuelLoad: parseFloat(fuelLoad) || 0,
                source,
                destination,
                sourceLat: sLat,
                sourceLng: sLng,
                destLat: dLat,
                destLng: dLng,
                departure: new Date(departure),
                arrival: arrivalDate,
                distance: distance,
                currentLat: sLat,
                currentLng: sLng,
                price: parseInt(price) || 0,
                seatsCount: parseInt(seatsCount) || 150,
                pilotName: pilotName || "Capt. Unknown",
                pilotBio: pilotBio || "Active Duty Pilot",
                pilotPhoto: imageUrl,
                operatorLogo: operatorLogo || null,
                sellerId,
                isActive: true,
                images: imageUrl ? { create: [{ url: imageUrl }] } : undefined
            },
            include: { images: true }
        });

        // Clean for JSON
        const safeFlight = JSON.parse(JSON.stringify(newFlight, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.status(201).json(safeFlight);
    } catch (error) {
        console.error("❌ [CREATE_ERROR]:", error);
        res.status(500).json({ error: error.message });
    }
};

// ==========================================
// 🌪️ RADAR ATC: TELEMETRY UPDATER
// ==========================================
export const updateFlightVitals = async(flightId) => {
    try {
        const flight = await prisma.listing.findUnique({ where: { id: flightId } });
        if (!flight) return;

        const now = new Date().getTime();
        const start = new Date(flight.departure).getTime();
        const end = new Date(flight.arrival).getTime();
        const progress = Math.max(0, Math.min(1, (now - start) / (end - start)));

        let lat = flight.sourceLat + (flight.destLat - flight.sourceLat) * progress;
        let lng = flight.sourceLng + (flight.destLng - flight.sourceLng) * progress;

        let condition = "CLEAR";
        let isDiverting = false;

        if (WEATHER_API_KEY) {
            try {
                const weatherReq = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}`
                );
                condition = weatherReq.data.weather[0].main;

                if (["Thunderstorm", "Squall", "Tornado", "Dust"].includes(condition)) {
                    isDiverting = true;
                    lat += 0.5;
                    lng += 0.5;
                }
            } catch (e) {
                console.warn(`[ATC_WEATHER] API fail for ${flight.airline}.`);
            }
        }

        await prisma.listing.update({
            where: { id: flightId },
            data: {
                currentLat: lat,
                currentLng: lng,
                weatherStatus: condition.toUpperCase(),
                isDiverting: isDiverting,
                lastUpdate: new Date(),
                heading: Math.atan2(flight.destLat - lat, flight.destLng - lng) * (180 / Math.PI) + 90
            }
        });
    } catch (error) {
        console.error(`[ATC_FATAL]:`, error.message);
    }
};

// ==========================================
// ✈️ GET ALL FLEET (FIXED FIELD: photoUrl)
// ==========================================
export const getAllListings = async(req, res) => {
    try {
        const flights = await prisma.listing.findMany({
            where: { isActive: true },
            include: {
                images: true,
                seller: { select: { id: true, name: true, photoUrl: true } } // ✅ FIXED
            },
            orderBy: { departure: "asc" }
        });

        // 🛡️ SERIALIZATION FIX
        const sanitizedData = JSON.parse(
            JSON.stringify(flights, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            )
        );

        console.log(`📡 [RADAR]: Dispatching ${sanitizedData.length} vessels.`);
        res.status(200).json(sanitizedData);
    } catch (error) {
        console.error("❌ [RADAR_SYNC_CRASH]:", error);
        res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message: error.message });
    }
};

// --- Other CRUD ---
export const getListingById = async(req, res) => {
    try {
        const { id } = req.params;
        const flight = await prisma.listing.findUnique({
            where: { id },
            include: {
                images: true,
                seller: { select: { name: true, photoUrl: true, createdAt: true } }, // ✅ FIXED
                reviews: {
                    include: { reviewer: { select: { name: true } } },
                    orderBy: { createdAt: "desc" }
                }
            }
        });
        if (!flight || !flight.isActive) return res.status(404).json({ error: "Vessel not found" });
        res.status(200).json(JSON.parse(JSON.stringify(flight)));
    } catch (error) {
        res.status(500).json({ error: "Briefing retrieval failure" });
    }
};

export const searchFlights = async(req, res) => {
    try {
        const { source, destination } = req.query;
        const flights = await prisma.listing.findMany({
            where: {
                source: { contains: source, mode: "insensitive" },
                destination: { contains: destination, mode: "insensitive" },
                isActive: true
            },
            include: { images: true }
        });
        res.status(200).json(JSON.parse(JSON.stringify(flights)));
    } catch (error) {
        res.status(500).json({ error: "Search failure" });
    }
};

export const addReview = async(req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const reviewerId = req.user.id;
        const review = await prisma.review.create({
            data: {
                rating: parseInt(rating),
                comment,
                listingId: id,
                reviewerId
            },
            include: { reviewer: { select: { name: true } } }
        });
        res.status(201).json(JSON.parse(JSON.stringify(review)));
    } catch (error) {
        res.status(500).json({ error: "Failed to post feedback" });
    }
};