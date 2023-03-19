import express, { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { CreateCustomerInputs } from '../dto/Customer.dto'
import { GenrateSalt, GenratePassword, GenerateOtp } from '../utility';
import { Customer } from '../models/Customer';



export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {

    const customerInputs = plainToClass(CreateCustomerInputs, req.body);

    const inputErrors = await validate(customerInputs, { validationError: { target: true } });

    if (inputErrors.length > 0) {   
        return res.status(400).json(inputErrors);
    }
    
    const { email, phone, password } = customerInputs;

    const salt = await GenrateSalt();
    const userPassword = await GenratePassword(password, salt);

    const { otp, expiry } =   GenerateOtp();

    console.log(otp, expiry)
    
    const result = await Customer.create({
        email: email,
        password: password,
        salt: salt, 
        phone: phone,
        otp: otp,
        otp_expiry: expiry,
        firstName: 'skldngakldsgkl',
        lastName: 'hsdgklals;dhkl',
        address: 'klasdglkas',
        verified: false,
        lat: 0,
        lng: 0
    })

    if (result) {
           res.json({result})
    }

        
        //send otp to the customer

        //generate the signature 

        //send result to the client
    

}


export const CustomerLogIn = async (req: Request, res: Response, next: NextFunction) => {

    
}

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {
    

}

export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {
 
    
}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    

}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    
}
