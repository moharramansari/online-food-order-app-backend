import express, { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { CreateCustomerInputs, userLoginInputs, EditCustomerProfileInputs, OrderInputs } from '../dto/Customer.dto'
import { GenrateSalt, GenratePassword, GenerateOtp, GenrateSignature, ValidatePassword } from '../utility';
import { Customer } from '../models/Customer';
import { Food } from '../models';
import { Order } from '../models/Order';
import { Offer } from '../models/Offer';



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

/** -------------------- Cart Section ---------------------- **/

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    
    const customer = req.user;

    if (customer) {

        const profile = await Customer.findById(customer._id).populate('cart.food')

        let cartItems = Array();

        const {_id, unit} = <OrderInputs>req.body;

        const food = await Food.findById(_id);
        
        if (food) {
            
            if (profile != null) {
                //check for the cart items
                cartItems = profile.cart;

                if (cartItems.length > 0) {
                    //check and udpate unit
                    let existFoodItem = cartItems.filter((item) => item.food._id.toString() === _id);

                    if (existFoodItem.length > 0) {
                        const index = cartItems.indexOf(existFoodItem[0]);
                        if (unit > 0) {
                            cartItems[index] = {food, unit}
                        } else {
                            cartItems.splice(index, 1)
                        }
                    } else {
                        cartItems.push({ food, unit })
                    }
                } else {
                    //add new item to cart
                    cartItems.push({food, unit})
                }
                if (cartItems) {
                    profile.cart = cartItems as any;
                    const cartresult = await profile.save();
                    return res.status(200).json(cartresult.cart)
                }
            }
        }
    }

    return res.status(400).json({message: 'Unable to create Cart!'})
}

export const GetCart = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    if (customer) {
        
        const profile = await Customer.findById(customer._id).populate('cart.food');
        if (profile) {
            return res.status(200).json(profile.cart)
        }
    }

     return res.status(400).json({message: 'Cart is empty!'})
}

export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {

        const customer = req.user;

    if (customer) {
        
        const profile = await Customer.findById(customer._id).populate('cart.food');
        if (profile != null) {

            profile.cart = [] as any;

            const cartresult = await profile.save();

            return res.status(200).json(cartresult)
        }
    }

     return res.status(400).json({message: 'Cart is already empty!'})

}

/** ------------------ Order Section -------------------- **/

export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {
    
    //grab current login customer
    const customer = req.user;

    if (customer) {

        //create an order ID
        const orderId = `${Math.floor(Math.random() * 89999) + 1000}`;

        const profile = await Customer.findById(customer._id);


        const cart = <[OrderInputs]>req.body; //[ { id : XX, unit : XX }]

        let cartItems = Array();
        console.log('cart items in the array ', cartItems)

        let netAmount = 0.0;

        let vandorId;
        
        //Calculate order amount
        const foods = await Food.find().where('_id').in(cart.map(item => item._id)).exec();
        console.log('Foods in the foods',foods);

        foods.map(food => {
            
            cart.map(({ _id, unit }) => {
                
                if (food._id == _id) {
                    vandorId = food.vandorId;
                    netAmount += (food.price * unit);
                   cartItems.push({ food, unit }) // unit 1 and 2 i,e 
                }
            })
        })

        console.log('+++++cart items', cartItems)

    //Create Order with Item description 
        if (cartItems) {
            //create order

            const currentOrder = await Order.create({
                orderID: orderId,
                vandorId : vandorId,
                items: cartItems,
                totalAmount: netAmount,
                orderDate: new Date(),
                paidThrough: 'COD',
                paymentResponse: 'Some json response stringify',
                orderStatus: 'Waiting',
                remarks: '',
                deliveryId: '',
                appliedOffers: false,
                offerId: null,
                readyTime : 45
            })

            if (currentOrder) {
                
                if (profile != null) {
                    profile.cart = [] as any;
                    const cartResult = await profile.save();
                    
                    return res.status(200).json(cartResult);
                }
            }
        }
    
    //Finally update orders to user account
    }

    return res.status(400).json({ message: 'Error with create order' })
}

export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {

    const customer = req.user;

    if (customer) {
        const profile = await Customer.findById(customer._id).populate("orders");

        if (profile) {
            return res.status(200).json(profile.orders)
        }
    }

     return res.status(400).json({ message: 'No Order Found!' })
}

export const GetOrderById = async (req: Request, res: Response, next: NextFunction) => {

    const orderId = req.params.id;

    if (orderId) {
        
        const order = await Order.findById(orderId).populate('items.food')

        return res.status(200).json(order);
    }

    return res.status(400).json({ message: 'Order Not Found!' })
}

export const VerifyOffer = async (req: Request, res: Response, next: NextFunction) => { 

    const offerId = req.params.id;

    const customer = req.user;

    if (customer) {

        const appliedOffer = await Offer.findById(offerId)

        if (appliedOffer) {
            
            if (appliedOffer.promoType == "USER") {
                
                //only can apply once per user
            } else {
                if (appliedOffer.isActive) {
                    return res.status(200).json({ message: 'Offer is valid ', offer: appliedOffer });
                }
            }
        }
    }
}




