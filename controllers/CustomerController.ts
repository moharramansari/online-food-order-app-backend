import express, { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { CreateCustomerInputs } from '../dto/Customer.dto'
import { GenrateSalt, GenratePassword, GenerateOtp, onRequestOTP, GenrateSignature } from '../utility';
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

    const { otp, expiry } = GenerateOtp();
    
    const existingCustomer = await Customer.findOne({ email: email });
    if (existingCustomer != null) {
        return res.status(409).json({message: 'An user exist with the provided email user '})
    }
    
    const result = await Customer.create({
        email: email,
        password: userPassword,
        salt: salt, 
        phone: phone,
        otp: otp,
        otp_expiry: expiry,
        firstName: 'Moharram',
        lastName: 'Ansari',
        address: 'Lucknow',
        verified: false,
        lat: 0,
        lng: 0
    })

    if (result) {

        //send otp to the customer
        // await onRequestOTP(otp, phone)

        //generate the signature

        const signature = GenrateSignature({
            _id: result._id,
            email: result.email,
            verified : result.verified
        })

        //send result to the client
        return res.status(201).json({signature : signature, verified: result.verified, email: result.email})
    }

    return res.status(201).json({message : 'Error with signup'})

}


export const CustomerLogIn = async (req: Request, res: Response, next: NextFunction) => {

    
}

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {

    const { otp } = req.body;
    const customer = req.user;

    if (customer) {
        
        const profile = await Customer.findById(customer._id);

        if (profile) {
            
            if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
                profile.verified = true

                const updateCustomerResponse = await profile.save();

                //generate the signature
                const signature = GenrateSignature({
                    _id: updateCustomerResponse._id,
                    email: updateCustomerResponse.email,
                    verified: updateCustomerResponse.verified
                });

                return res.status(200).json({
                    signature: signature,
                    verified: updateCustomerResponse.verified,
                    email: updateCustomerResponse.email
                });
            }
        }
    }
        return res.status(201).json({message : 'Error with OTP Validation '})
}

export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {
 
    
}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    

}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    
}
