import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
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

export const createListing = async(req, res) => {
    try {
        const { airline, source, destination, sourceLat, sourceLng, destLat, destLng, departure, price } = req.body;
        const sLat = parseFloat(sourceLat);
        const sLng = parseFloat(sourceLng);
        const dLat = parseFloat(destLat);
        const dLng = parseFloat(destLng);

        const distance = calculateDistance(sLat, sLng, dLat, dLng);
        const arrivalDate = new Date(new Date(departure).getTime() + ((distance / CRUISE_SPEED_KMH) * 3600000));

        const newFlight = await prisma.listing.create({
            data: {
                airline,
                source,
                destination,
                sourceLat: sLat,
                sourceLng: sLng,
                destLat: dLat,
                destLng: dLng,
                departure: new Date(departure),
                arrival: arrivalDate,
                currentLat: sLat,
                currentLng: sLng,
                price: parseInt(price) || 0,
                sellerId: req.user.id,
                isActive: true
            }
        });
        res.status(201).json(newFlight);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllListings = async(req, res) => {
    try {
        await prisma.$connect();
        const flights = await prisma.listing.findMany({
            where: { isActive: true },
            include: { images: true, seller: { select: { name: true, photoUrl: true } } }
        });

        // Serialization Fix for BigInt
        const sanitized = JSON.parse(JSON.stringify(flights, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        console.log(`📡 [RADAR]: Dispatching ${sanitized.length} vessels.`);
        res.status(200).json(sanitized);
    } catch (error) {
        console.error("❌ [RADAR_CRASH]:", error.message);
        res.status(500).json([]);
    }
};

export const addReview = async(req, res) => {
    try {
        const review = await prisma.review.create({
            data: {
                rating: parseInt(req.body.rating),
                comment: req.body.comment,
                listingId: req.params.id,
                reviewerId: req.user.id
            }
        });
        res.status(201).json(JSON.parse(JSON.stringify(review)));
    } catch (error) {
        res.status(500).json({ error: "Review failure" });
    }
};

// Add stubs for other exports required by your routes
export const getListingById = async(req, res) => { /* logic */ res.json({}); };
export const searchFlights = async(req, res) => { /* logic */ res.json([]); };