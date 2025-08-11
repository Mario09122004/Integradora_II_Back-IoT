import connectDB from "./src/config/db.js"
import app from "./src/app.js";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT_EXPRESS || 3005;

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
})