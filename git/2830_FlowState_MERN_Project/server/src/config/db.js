import dns from 'node:dns/promises';
import mongoose from 'mongoose';

dns.setServers(['1.1.1.1', '8.8.8.8']);

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1);
    }
};

export default { connect };