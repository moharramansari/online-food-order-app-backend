import mongoose, {Schema, Document} from "mongoose";

export interface OrderDoc extends Document{
    orderID: string, //5948764
    vendorId: string,
    items: [any], //{Food , unit}
    totalAmount: number, //600.00
    paidAmount : number,
    orderDate: Date, //Date
    orderStatus: string, // To determine the current status // waiting // FAILED //ACCEPT //onway //REJECT // UNDER-PROCESS // READY  
    remarks: string, // resaon for cancel the order
    deliveryId: string, 
    readyTime: number //max 60 minutes
}

const OrderSchema = new Schema({
    orderID: { type: String, required: true }, //5948764
    vendorId : { type: String, required: true },
    items: [
        {
            food: { type: Schema.Types.ObjectId, ref: "food", require: true },
            unit: { type: Number, required: true }
        }
    ],
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, required: true },
    orderDate: { type: Date },
    orderStatus: { type: String },
    remarks: { type: String }, // resaon for cancel the order
    deliveryId: { type: String },
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