
import { IsEmail, IsEmpty, Length } from "class-validator";
export class CreateCustomerInputs {

    @IsEmail()
    email: string;

    @Length(7, 12)
    phone: string;

    @Length(7, 12)
    password: string;
}

export class userLoginInputs {

    @IsEmail()
    email: string;

    @Length(7, 12)
    password: string;

}

export class EditCustomerProfileInputs {

    @Length(3, 16)
    firstName: string;

     @Length(3, 16)
    lastName: string;

     @Length(6, 16)
    address: string;
}

export interface CustomerPayload{
    _id: string;
    email: string;
    verified : boolean
}

export class cartItems {
    _id: string;

    unit: number;
}
export class OrderInputs {

    txnId: string;
    amount: string;
    items: [cartItems];
    
}


export class CreateDeliveryUserInputs {

    @IsEmail()
    email: string;

    @Length(7, 12)
    phone: string;

    @Length(7, 12)
    password: string;

    @Length(3, 12)
    firstName: string;

    @Length(3, 12)
    lastName: string;

    @Length(6, 12)
    address: string;

    @Length(4, 12)
    pincode: string;
}

// export class EditDeliveryProfileInputs {

//     @Length(3, 16)
//     firstName: string;

//      @Length(3, 16)
//     lastName: string;

//      @Length(6, 16)
//     address: string;
// }