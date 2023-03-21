import express, { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { CreateCustomerInputs, userLoginInputs, EditCustomerProfileInputs, OrderInputs } from '../dto/Customer.dto'
import { GenrateSalt, GenratePassword, GenerateOtp, GenrateSignature, ValidatePassword } from '../utility';
import { Customer } from '../models/Customer';
import { Food } from '../models';
import { Order } from '../models/Order';



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
        lng: 0,
        orders : []
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
    
    const loginInputs = plainToClass(userLoginInputs, req.body);

    const loginErrors = await validate(loginInputs, { validationError: { target: true } })

    if (loginErrors.length > 0) {
        return res.status(400).json(loginErrors);
    }

    const { email, password } = loginInputs;

    const customer = await Customer.findOne({ email: email })

    if (customer) {
        
        const validation = await ValidatePassword(password, customer.password, customer.salt);

        if (validation) {
            
            //generate the signature
            const signature = GenrateSignature({
                _id: customer._id,
                email: customer.email,
                verified: customer.verified
            })

             //send result to the client
            return res.status(201).json({
                signature: signature,
                verified: customer.verified,
                email: customer.email
            })
        }
    }

   return res.status(404).json({message : 'Login error'})

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
        return res.status(400).json({message : 'Error with OTP Validation '})
}

export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {
    
    const customer = req.user
    
    if (customer) {

        const profile = await Customer.findById(customer._id);
        
        if (profile) {
            
            const { otp, expiry } = GenerateOtp();
            profile.otp = otp;
            profile.otp_expiry = expiry

            await profile.save();
            // await onRequestOTP(otp, profile.phone);

            res.status(200).json({ message: "OTP sent to your register phone number" })

        }
    }

    return res.status(400).json({message: `Error with request OTP`})
}

export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;
    
    if (customer) {
        
        const profile = await Customer.findById(customer._id);

        if (profile) {
            return res.status(200).json(profile)
        }
    }

    return res.status(400).json({ message: "Error with fetch profle" })

}

export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    const profileInputs = plainToClass(EditCustomerProfileInputs, req.body)

    const profileErrors = await validate(profileInputs, { validationError: { target: false } })

    if (profileErrors.length > 0) {
        return res.status(400).json(profileErrors)
    }

    const { firstName, lastName, address } = profileInputs;

    if (customer) {
        
        const profile = await Customer.findById(customer._id)

        if (profile) {
            
            profile.firstName = firstName,
            profile.lastName = lastName,
                profile.address = address
            
            const result = await profile.save();

            return res.status(200).json(result)
        }
    }
}


export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {
    
    //grab current login customer
    const customer = req.user;

    if (customer) {

        //create an order ID
        const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

        const profile = await Customer.findById(customer._id);


        const cart = <[OrderInputs]>req.body; //[ { id : XX, unit : XX }]

        let cartItems = Array();

        let netAmount = 0.0;
        
        //Calculate order amount
        const foods = await Food.find().where('_id').in(cart.map(item => item._id)).exec();

        foods.map(food => {
            
            cart.map(({ _id, unit }) => {
                
                if (food._id == _id) {
                    netAmount += (food.price * unit);
                    cartItems.push({ food, unit })
                }
            })
        })

    //Create Order with Item description 
        if (cartItems) {
            //create order

            const currentOrder = await Order.create({
                orderID: orderId,
                items: cartItems,
                totalAmount: netAmount,
                orderDate: new Date(),
                paidThrough: 'COD',
                paymentResponse: '',
                orderStatus: 'Waiting'
            })

            if (currentOrder) {
                
                profile?.orders.push(currentOrder);
                const profileResponse = await profile?.save();

                return res.status(200).json(profileResponse)
            }
        }
    
    //Finally update orders to user account
    }

    return res.status(400).json({ message: 'Error with create order' })
}

export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {
 
    
}

export const GetOrderById = async (req: Request, res: Response, next: NextFunction) => {
    
}


