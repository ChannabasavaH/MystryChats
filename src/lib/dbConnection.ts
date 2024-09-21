import mongoose from "mongoose";

type isConnectedObject = {
    isConnected?: number | string;
}

const connection: isConnectedObject = {}

async function dbConnection(): Promise<void> {
    if (connection.isConnected) {
        console.log("Database is already connected")
        return
    }

    try {
        const db = await mongoose.connect(process.env.DBURI ?? "",{})
        // console.log(db)
        // console.log(db.connections)
        connection.isConnected = db.connections[0].readyState
        console.log("DB is connected successfully")
    } catch (error) {
        console.log("Database connection failed")
        process.exit(1);
    }
}

export default dbConnection