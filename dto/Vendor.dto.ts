export interface CreateVandorInput {
    name: string;
    ownerName: string;
    foodType: [string];
    pincode: string;
    address: string;
    phone: string;
    email: string;
    password: string;
}

export interface EditVandorInputs{
    name: string;
    address: string;
    phone: string;
    foodTypes : [string]
}

export interface VandorLoginInputs {
    email: string;
    password: string;
}

export interface VandorPayload {
    _id: string;
    email: string;
    name: string;
    foodTypes: [string];
}

export interface CreateOfferInputs {

    offerType: string, // VEDNDOR // GENERIC
    vendors: [any], // ['76796788DSFD]
    title: string,  // INR 200 off on week days
    description: string, // Any description with term and condition
    minValue: number, // Minimum order amount should 300
    offerAmount: number, //200
    startValidity: Date,
    endValidity: Date,
    promoCode: string, // WEEK200
    promoType: string, // USER // ALL // BANK // CARD
    bank: [any],
    bins: [any],
    pincode: string,
    isActive: boolean
}