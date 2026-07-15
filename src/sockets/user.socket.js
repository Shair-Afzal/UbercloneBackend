import { User } from "../models/User/user.model.js";


export const registeruserevent = (io, socket) => {

    socket.on("join-user", async (data) => {

        try {

            const { userId } = data;

            socket.join(userId.toString());

            socket.data.userId = userId;

            io.emit("user-online", {
                userId,
                isOnline:true
            });

            console.log("User joined:", userId);

        } catch(err) {

            console.log(err);

        }

    });


    socket.on("disconnect", () => {

        console.log(
            "User disconnected:",
            socket.id
        );

    });

};