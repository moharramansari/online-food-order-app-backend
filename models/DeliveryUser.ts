import mongoose, { Schema, Document, Model } from "mongoose";

interface DeliveryUserDoc extends Document{

    email: string;
    password: string;
    salt: string;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    pincode: string;
    verified: boolean;
    lat: number;
    lng: number;
    isAvailable: boolean;
}

const DeliveryUserSchema = new Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    pincode: {type: String, require: true},
    verified: { type: Boolean, require: true },
    lat: { type: Number, require: true },
    lng: { type: Number, require: true },
    isAvailable: { type: Boolean }
},
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.password,
                delete ret.salt,
                delete ret.__v,
                delete ret.createdAt,
                delete ret.updatedAt
            }
    },
    timestamps : true
})

    const DeliveryUser = mongoose.model<DeliveryUserDoc>('delivery_user', DeliveryUserSchema)

export { DeliveryUser }