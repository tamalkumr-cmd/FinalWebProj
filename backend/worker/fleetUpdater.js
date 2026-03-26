import { PrismaClient } from "@prisma/client";
import { updateFlightVitals } from "../src/controllers/listing.controller.js"; // Adjust path if needed
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function startATC() {
    console.log("🚀 [ATC_SYSTEM]: Online. Monitoring global vectors...");

    setInterval(async() => {
        try {
            const activeFlights = await prisma.listing.findMany({
                where: {
                    departure: { lte: new Date() },
                    arrival: { gte: new Date() },
                    isActive: true
                }
            });

            for (const flight of activeFlights) {
                // We call the controller function we just made
                await updateFlightVitals(flight.id);
            }

            if (activeFlights.length > 0) {
                console.log(`✅ [ATC]: Updated ${activeFlights.length} airborne vessels.`);
            }
        } catch (error) {
            console.error("❌ [ATC_ERROR]:", error.message);
        }
    }, 30000); // Run every 30 seconds
}

startATC();