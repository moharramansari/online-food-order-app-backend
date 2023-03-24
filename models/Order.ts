import mongoose, {Schema, Document} from "mongoose";

export interface OrderDoc extends Document{
    orderID: string; //5948764
    vandorId: string;
    items: [any];
    totalAmount: {type : Number, required : true},
    orderDate: Date;
    paidThrough: string; //COD, Credit Card, Wallet
    paymentResponse: string; //{status: true, response: some bank response}
    orderStatus: string;// To determine the current status // waiting // ACCEPT //onway //REJECT // UNDER-PROCESS // READY  
    remarks: string; // resaon for cancel the order
    deliveryId: string; 
    appliedOffers: boolean;
    offerId: string;
    readyTime: number; //max 60 minutes
}

const OrderSchema = new Schema({
    orderID: { type: String, required: true }, //5948764
    vandorId : { type: String, required: true },
    items: [
        {
            food: { type: Schema.Types.ObjectId, ref: "food", require: true },
            unit: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date },
    paidThrough: { type: String }, //COD, Credit Card, Wallet
    paymentResponse: { type: String },//{status: true, response: some bank response}
    orderStatus: { type: String },
    remarks: { type: String }, // resaon for cancel the order
    deliveryId: { type: String },
    appliedOffers:{ type: Boolean },
    offerId: { type: String },
    readyTime:{ type: Number }, //max 60 minutes
},
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.__v,
                delete ret.createdAt,
                delete ret.updatedAt
            }
        },
    timestamps: true
    })

const Order = mongoose.model<OrderDoc>('order', OrderSchema)

export  { Order }