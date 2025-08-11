import app from './src/app.js';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';

dotenv.config();

const PORT = process.env.PORT_EXPRESS || 3006;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}/v1/pedidos`);
    });
});

