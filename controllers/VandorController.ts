import { Request, Response, NextFunction } from "express";
import { CreateOfferInputs, EditVandorInputs, VandorLoginInputs } from "../dto";
import { createFoodInputs } from "../dto/Food.dto";
import { Food } from "../models/Food";
import { GenrateSignature, ValidatePassword } from "../utility";
import { FindVandor } from "./AdminController";
import { Multer } from "multer";
import { Order }  from "../models/Order";
import { Offer } from "../models/Offer";


export const VandorLogin = async (req: Request, res: Response, next: NextFunction) => {

    const { email, password } = <VandorLoginInputs>req.body;
    
    const existingVandor = await FindVandor('', email);

    if (existingVandor !== null) {
        //validation and given access
        const validation = await ValidatePassword(password, existingVandor.password, existingVandor.salt);

        if (validation) {
            const signature = GenrateSignature({
                _id: existingVandor._id,
                email: existingVandor.email,
                foodTypes: existingVandor.foodType,
                name : existingVandor.email
            })
            return res.json(signature)
        } else {
            return res.json({"message" : "Password is not valid"})
        }
    }

    return res.json({"message" : "Login cridential not valid"})
}

export const GetVandorProfile = async (req: Request, res: Response, next: NextFunction) => {    
    const user = req.user;
    if (user) {
        const existingVandor = await FindVandor(user._id)
        return res.json(existingVandor)
    }

    return res.json({"message" : "Vandor information Not Found"})
}

export const UpdateVandorProfile = async (req: Request, res: Response, next: NextFunction) => { 

    const { foodTypes, name, address, phone } = <EditVandorInputs>req.body;
    
    const user = req.user;

    if (user) {
        const existingVandor = await FindVandor(user._id)

        if (existingVandor !== null) {
            existingVandor.name = name;
            existingVandor.address = address;
            existingVandor.phone = phone;
            existingVandor.foodType = foodTypes

            const savedResult = await existingVandor.save();
            return res.json(savedResult);
        }

        return res.json(existingVandor)
    }

    return res.json({"message" : "Vandor information Not Found"})
}

export const UpdateVandorService = async (req: Request, res: Response, next: NextFunction) => { 

    const user = req.user;

    if (user) {
        const existingVandor = await FindVandor(user._id)

        if (existingVandor !== null) {
            existingVandor.serviceAvailble = !existingVandor.serviceAvailble

            const savedResult = await existingVandor.save();
            return res.json(savedResult);
        }

        return res.json(existingVandor)
    }

    return res.json({"message" : "Vandor information Not Found"})
}

//TODO 
export const AddFood = async (req: Request, res: Response, next: NextFunction) => { 

    const user = req.user;

    if (user) {

        const {name, description, category, foodType, readyTime, price} = <createFoodInputs>req.body;

        const vandor = await FindVandor(user._id)

        if (vandor !== null) {

            const files = req.files as [Express.Multer.File];

            const images = files.map((file: Express.Multer.File) => file.filename);

            const createFood = await Food.create({
                vandorId: vandor._id,
                name: name,
                description: description,
                category: category,
                foodType: foodType,
                images: images,
                readyTime: readyTime,
                price: price,
                rating : 0
            })

            vandor.foods.push(createFood);
            const result = await vandor.save();

            return res.json(result)
        }
    }

    res.json({"message" : "Food information not found"})
}

export const GetFoods = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {

        const foods = await Food.find({vandorId : user._id})

        if (foods !== null) {
            return res.json(foods)
        }
    }

    return res.json({"message" : "Foods information Not found"})

 }


export const GetCurrentOrders = async (req: Request, res: Response, next: NextFunction) => {

    const user = req.user;

    if (user) {

        const orders = await Order.find({ vandorId: user._id }).populate('items.food');

        if (orders != null) {
            return res.status(200).json(orders);
        }
    }

     return res.json({"message" : "Order information Not found"})
}


export const GetOrderDetails = async (req: Request, res: Response, next: NextFunction) => {

    const orderID = req.params.id;
    
    if (orderID) {

        const order = await Order.findById(orderID).populate('items.food');

        if (order != null) {
            return res.status(200).json(order);
        }
    }

     return res.json({"message" : "Order information Not found"})

}


export const ProcessOrder = async (req: Request, res: Response, next: NextFunction) => { 

    const orderId = req.params.id;

    const { status, remarks, time } = req.body; //ACCEPT // REJECT // UNDER-PROCESS //READY

    if (orderId) {
        
        const order = await Order.findById(orderId).populate('items.food')

        if (order != null) {
            order.orderStatus = status;
            order.remarks = remarks;

            if (time) {
                order.readyTime = time
            }
        }
        
        const orderResult = await order?.save();

        if (orderResult != null) {
            return res.status(200).json(orderResult)
        }
    }

      return res.json({"message" : "Unable to process order"});

}

export const GetOffers = async (req: Request, res: Response, next: NextFunction) => { 

    const user = req.user;

    if (user) {

        let currentOffers = Array();

        const offers = await Offer.find().populate('vendors');

        if (offers) {
            offers.map(item => {
                if (item.vendors) {
                    item.vendors.map(vendor => {
                        if (vendor._id.toString() === user._id) {
                            currentOffers.push(item);
                        }
                    })
                }

                if (item.offerType === 'GENERIC') {
                    currentOffers.push(item)
                }

            })
        } 

        return res.status(200).json(currentOffers)
    }

    return res.json({"message" : "Offer not available!"});
}


export const AddOffer = async (req: Request, res: Response, next: NextFunction) => { 

    const user = req.user

    if (user) {
        
        const { title, description, offerType, offerAmount, pincode,
            promoCode, promoType, startValidity, endValidity, bank, bins, minValue, isActive } = <CreateOfferInputs>req.body;
        
        const vendor = await FindVandor(user._id);

        if (vendor) {
            
            const offer = await Offer.create({
                title,
                description,
                offerType,
                offerAmount,
                pincode,
                promoCode,
                promoType,
                startValidity,
                endValidity,
                bank,
                bins,
                minValue,
                isActive,
                vendors: [vendor]
            })

            console.log(offer);
            return res.status(201).json(offer)
        }

        return res.json({"message" : "Unable to Add a offer!"});
    }
}

export const EditOffer = async (req: Request, res: Response, next: NextFunction) => { 

    const user = req.user

    const offerId = req.params.id;

    if (offerId) {
        
            if (user) {
        
        const { title, description, offerType, offerAmount, pincode,
            promoCode, promoType, startValidity, endValidity, bank, bins, minValue, isActive } = <CreateOfferInputs>req.body;
        
                const currentOffers = await Offer.findById(offerId);

                if (currentOffers) {
                    const vendor = await FindVandor(user._id);

                    if (vendor) {
                        currentOffers.title = title;
                        currentOffers.description = description;
                        currentOffers.offerType = offerType;
                        currentOffers.offerAmount = offerAmount;
                        currentOffers.pincode = pincode;
                        currentOffers.promoCode = promoCode;
                        currentOffers.promoType = promoType;
                        currentOffers.startValidity = startValidity;
                        currentOffers.endValidity = endValidity;
                        currentOffers.bank = bank;
                        currentOffers.bins = bins;
                        currentOffers.minValue = minValue;
                        currentOffers.isActive = isActive;
                    }
                    
                    const result = await currentOffers.save()
                    return res.status(200).json(result)
                }
                
                }
    }

    return res.json({ "message": "Unable to Add a offer!" });
    }
    
    





