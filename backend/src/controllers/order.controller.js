import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// ===============================
// CREATE BOOKING (FLIGHT)
// ===============================
export const createOrder = async(req, res) => {
    try {
        const { listingId, passengers } = req.body;
        const buyerId = req.user.id;

        if (!listingId || !passengers) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // 1. Find flight
        const flight = await prisma.listing.findUnique({
            where: { id: listingId }
        });

        if (!flight || !flight.isActive) {
            return res.status(400).json({ error: "Flight not available" });
        }

        // 2. Check seat availability
        if (flight.seats < passengers) {
            return res.status(400).json({ error: "Not enough seats available" });
        }

        // 3. Prevent booking own flight (optional but clean)
        if (flight.sellerId === buyerId) {
            return res.status(400).json({ error: "You cannot book your own flight" });
        }

        // 4. Transaction: create booking + reduce seats
        const [booking, updatedFlight] = await prisma.$transaction([
            prisma.order.create({
                data: {
                    buyerId,
                    listingId,
                    passengers: parseInt(passengers),
                    status: "CONFIRMED",
                    amount: flight.price * passengers
                }
            }),

            prisma.listing.update({
                where: { id: listingId },
                data: {
                    seats: {
                        decrement: parseInt(passengers)
                    }
                }
            })
        ]);

        res.status(201).json({
            message: "Booking successful ✈️",
            booking
        });

    } catch (error) {
        console.error("Booking Error:", error);
        res.status(500).json({ error: "Failed to create booking" });
    }
};

// ===============================
// GET MY BOOKINGS
// ===============================
export const getMyOrders = async(req, res) => {
    try {
        const bookings = await prisma.order.findMany({
            where: { buyerId: req.user.id },
            include: {
                listing: {
                    include: {
                        seller: { select: { name: true } },
                        images: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        res.json(bookings);
    } catch (error) {
        console.error("Fetch Bookings Error:", error);
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
};