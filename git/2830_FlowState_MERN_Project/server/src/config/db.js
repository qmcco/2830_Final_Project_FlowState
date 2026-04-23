import mongoose from 'mongoose';

const connect = async () => {
    await mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log(`MongoDB connected: ${mongoose.connection.host}`))
        .catch((error) => {
            console.error('Failed to connect to MongoDB', error);
            process.exit(1);
        });
}

export default { connect };