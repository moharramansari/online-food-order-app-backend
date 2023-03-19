import mongoose, { ConnectOptions } from 'mongoose';
import { MONGO_URI } from '../config';

export default async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
        } as ConnectOptions)
        console.log("Database Connected Successfuly.")
    } catch (ex) {
        console.log(ex)
    }
}