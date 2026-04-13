import { Server } from "socket.io"
import { getAllmatches, getLivematches } from "../services/match.service.ts"

export const initSocket = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });


    io.on("connection", (socket) => {
        console.log('User connected:', socket.id)


        const interval = setInterval(async () => {
            try {
                const matches = await getAllmatches();
                socket.emit("Allmatches", matches);

            } catch (error) {
                console.error("Error sending matches")
            };

            try {
                const matches = await getLivematches()
                socket.emit("livematches", matches)
            } catch (error) {
                console.error("Error sending live matches");
            }
        }, 1000);

        socket.on("disconnect", () => {
            console.log("User disconnected");
            clearInterval(interval);
        });
    });
};