import express, { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { CreateCustomerInputs, userLoginInputs, EditCustomerProfileInputs, OrderInputs, cartItems, CreateDeliveryUserInputs } from '../dto/Customer.dto'
import { GenrateSalt, GenratePassword, GenerateOtp, GenrateSignature, ValidatePassword } from '../utility';
import { DeliveryUser } from '../models';



export const DeliveryUserSignUp = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUserInputs = plainToClass(CreateDeliveryUserInputs, req.body);

    const inputErrors = await validate(deliveryUserInputs, { validationError: { target: true } });

    if (inputErrors.length > 0) {   
        return res.status(400).json(inputErrors);
    }
    
    const { email, phone, password, firstName, lastName, address, pincode} = deliveryUserInputs;

    const salt = await GenrateSalt();
    const userPassword = await GenratePassword(password, salt);
    
    const existingDeliveryUser = await DeliveryUser.findOne({ email: email });

    if (existingDeliveryUser != null) {
        return res.status(409).json({message: 'An Delivery user exist with the provided email user '})
    }
    
    const result = await DeliveryUser.create({
        email: email,
        password: userPassword,
        salt: salt, 
        phone: phone,
        firstName: firstName,
        lastName: lastName,
        address: address,
        pincode: pincode,
        verified: false,
        lat: 0,
        lng: 0,
        isAvailable : false
    })

    if (result) {

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


export const DeliveryUserLogIn = async (req: Request, res: Response, next: NextFunction) => {
    
    const loginInputs = plainToClass(userLoginInputs, req.body);

    const loginErrors = await validate(loginInputs, { validationError: { target: true } })

    if (loginErrors.length > 0) {
        return res.status(400).json(loginErrors);
    }

    const { email, password } = loginInputs;

    const deliveryUser = await DeliveryUser.findOne({ email: email })

    if (deliveryUser) {
        
        const validation = await ValidatePassword(password, deliveryUser.password, deliveryUser.salt);

        if (validation) {
            
            //generate the signature
            const signature = GenrateSignature({
                _id: deliveryUser._id,
                email: deliveryUser.email,
                verified: deliveryUser.verified
            })

             //send result to the client
            return res.status(201).json({
                signature: signature,
                verified: deliveryUser.verified,
                email: deliveryUser.email
            })
        }
    }

   return res.status(404).json({message : 'Login error'})

}



export const GetDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {

   const delivery_user = req.user;
    
    if (delivery_user) {
        
        const profile = await DeliveryUser.findById(delivery_user._id);

        if (profile) {
            return res.status(200).json(profile)
        }
    }

    return res.status(400).json({ message: "Error with fetch profle" })

}

export const EditDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUser = req.user;

    const profileInputs = plainToClass(EditCustomerProfileInputs, req.body)

    const profileErrors = await validate(profileInputs, { validationError: { target: false } })

    if (profileErrors.length > 0) {
        return res.status(400).json(profileErrors)
    }

    const { firstName, lastName, address } = profileInputs;

    if (deliveryUser) {
        
        const profile = await DeliveryUser.findById(deliveryUser._id)

        if (profile) {
            
            profile.firstName = firstName,
            profile.lastName = lastName,
            profile.address = address
            
            const result = await profile.save();

            return res.status(200).json(result)
        }
    }

    return res.status(400).json({ message: "Error with fetch profle" })

}

export const UpdateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => {

    const deliveryUser = req.user;

    if (deliveryUser) {

        const { lat, lng } = req.body;
        const profile = await DeliveryUser.findById(deliveryUser._id);

        if (profile) {

            if (lat && lng) {
                profile.lat = lat;
                profile.lng = lng;
            }

            profile.isAvailable = !profile.isAvailable;

            const result = await profile.save();

            return res.status(200).json(result);
        }
    }

      return res.status(400).json({ message: "Error with update status" })

}
