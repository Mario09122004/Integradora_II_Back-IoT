import app from "./src/app.js";
import dotenv from 'dotenv';
import connectDB from "./src/config/dbConfig.js";

dotenv.config();

const PORT = process.env.PORT_EXPRESS || 3001;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}/v1/usuarios`);
    });
});