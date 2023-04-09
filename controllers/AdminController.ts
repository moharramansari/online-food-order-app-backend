import { Request,Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import { DeliveryUser, Transaction, Vendor } from "../models";
import { GenratePassword, GenrateSalt } from "../utility";


export const FindVendor = async (id: string | undefined, email?: string) => {
    if (email) {
        return await Vendor.findOne({email: email})
    } else {
        return await Vendor.findById(id)
    }
}


export const createVendor = async (req: Request, res: Response, next: NextFunction) => {
    const {name, address, pincode, foodType, email, password, ownerName, phone} = <CreateVendorInput>req.body;

    const existingVendor = await FindVendor('', email);

    if (existingVendor !== null) {
        return res.json({"message" : "A vadnor is exist with this email ID"})
    }

    //generate a salt

    const salt = await GenrateSalt()
    const userPassword = await GenratePassword(password, salt)
    //encrypt the password using salt

    const createdVendor = await Vendor.create({
        name: name,
        address: address,
        pincode: pincode,
        foodType: foodType,
        email: email,
        password: userPassword,
        salt : salt,
        ownerName: ownerName,
        phone: phone,
        rating: 0,
        serviceAvailble: false,
        coverImages: [],
        foods : []
    })

    res.json(createdVendor)
}

export const GetVendors = async (req: Request, res: Response, next: NextFunction) => {
    const vendors = await Vendor.find();

    if (vendors !== null) {
        return res.json(vendors)
    }

    return res.json({"message" : "Vendors data not available"})
}

export const GetVendorByID = async (req: Request, res: Response, next: NextFunction) => {
    const vendorId = req.params.id;

    const vendor = await FindVendor(vendorId);

    if (vendor !== null) {
        return res.json(vendor)
    }

    return res.json({"message" : "Vendor data not available"})
}

export const GetTransactions = async (req: Request, res: Response, next: NextFunction) => {

    const transactions = await Transaction.find();

    if (transactions) {
        return res.status(200).json(transactions)
    }

    return res.json({"message" : "Transaction not available"})

}

export const GetTransactionbyID = async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params.id;

    const transactions = await Transaction.findById(id);

    if (transactions) {
        return res.status(200).json(transactions)
    }

    return res.json({"message" : "Transaction not available"})
    
}

export const VerifyDeliveryUser = async (req: Request, res: Response, next: NextFunction) => { 

    const { _id, status } = req.body;

    if (_id) {
        
        const profile = await DeliveryUser.findById(_id);

        if (profile) {
            
            profile.verified = status;

            const result = await profile.save();

            return res.status(200).json(result);
        }

    }

    return res.json({ "message": "Unable to verify Delivery User" });

}