import mongoose, {Schema, Document} from "mongoose";

export interface OrderDoc extends Document{
    orderID: string; //5948764
    items: [];
    totalAmount: {type : Number, required : true},
    orderDate: Date;
    paidThrough: string; //COD, Credit Card, Wallet
    paymentResponse: string; //{status: true, response: some bank response}
    orderStatus: string;
}

const OrderSchema = new Schema({
    orderID:{type:String, required :true}, //5948764
    items: [
        {
            food: { type: Schema.Types.ObjectId, ref: "food", required: true },
            unit:{type : Number, required : true}
        }
    ],
    totalAmount: {type : Number, required : true},
    orderDate: {type: Date},
    paidThrough: {type:String}, //COD, Credit Card, Wallet
    paymentResponse: {type: String}, //{status: true, response: some bank response}
    orderStatus: {type: String}
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