import { useState, useEffect, useRef } from 'react';

export const useVesselSim = (product, initialMultiplier = 1) => {
    const [multiplier, setMultiplier] = useState(initialMultiplier);
    const [simTime, setSimTime] = useState(new Date().getTime());
    const lastUpdateRef = useRef(new Date().getTime());

    const [telemetry, setTelemetry] = useState({
        pos: { lat: 0, lng: 0 },
        progress: 0,
        fuel: 100,
        status: "STANDBY",
        altitude: 0
    });

    useEffect(() => {
        if (!product) return;

        const heartbeat = setInterval(() => {
            const realNow = new Date().getTime();
            const delta = realNow - lastUpdateRef.current;
            lastUpdateRef.current = realNow;

            // 🕒 THE PHYSICS: Advance simulated time by delta * multiplier
            setSimTime(prev => {
                const newSimTime = prev + (delta * multiplier);

                const start = new Date(product.departure).getTime();
                const end = new Date(product.arrival).getTime();

                let progress = (newSimTime - start) / (end - start);
                if (progress < 0) progress = 0;
                if (progress > 1) progress = 1;

                const currentLat = product.sourceLat + (product.destLat - product.sourceLat) * progress;
                const currentLng = product.sourceLng + (product.destLng - product.sourceLng) * progress;
                const altBase = Math.sin(progress * Math.PI) * 36000;

                setTelemetry({
                    pos: { lat: currentLat, lng: currentLng },
                    progress: (progress * 100).toFixed(2),
                    fuel: (100 - (progress * 40)).toFixed(1),
                    altitude: progress > 0 && progress < 1 ? Math.floor(altBase) : 0,
                    status: progress <= 0 ? "PRE-FLIGHT" : progress >= 1 ? "ARRIVED" : "AIRBORNE",
                    currentTime: new Date(newSimTime).toLocaleTimeString()
                });

                return newSimTime;
            });
        }, 100); // 10Hz update for smooth movement

        return () => clearInterval(heartbeat);
    }, [product, multiplier]);

    return { telemetry, multiplier, setMultiplier };
};