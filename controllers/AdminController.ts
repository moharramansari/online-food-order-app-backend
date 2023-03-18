import { Request,Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";
import { Vandor } from "../models";

export const createVandor = async (req: Request, res: Response, next: NextFunction) => {
    const {name, address, pincode, foodType, email, password, ownerName, phone} = <CreateVandorInput>req.body;

    const createdVandor = await Vandor.create({
        name: name,
        address: address,
        pincode: pincode,
        foodType: foodType,
        email: email,
        password: password,
        salt : 'tata salt',
        ownerName: ownerName,
        phone: phone,
        rating: 0,
        serviceAvailble: false,
        coverImages: []
    })

    res.json({createdVandor})
}

export const GetVandors = async (req: Request, res: Response, next: NextFunction) => {
    
}

export const GetVandorByID = async (req: Request, res: Response, next: NextFunction) => {
    
}