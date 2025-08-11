import app from "./src/app.js"
import dotenv from 'dotenv';
import connectDB from "./src/config/db.js"

dotenv.config();

const PORT = process.env.PORT_EXPRESS || 3003;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}/v1/analisis`);
    });
})
