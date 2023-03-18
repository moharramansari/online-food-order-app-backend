import { Request,Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";
import { Vandor } from "../models";
import { GenratePassword, GenrateSalt } from "../utility";

export const createVandor = async (req: Request, res: Response, next: NextFunction) => {
    const {name, address, pincode, foodType, email, password, ownerName, phone} = <CreateVandorInput>req.body;

    const existingVandor = await Vandor.findOne({email:email})

    if (existingVandor !== null) {
        return res.json({"message" : "A vadnor is exist with this email ID"})
    }

    //generate a salt

    const salt = await GenrateSalt()
    const userPassword = await GenratePassword(password, salt)
    //encrypt the password using salt

    const createdVandor = await Vandor.create({
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
        coverImages: []
    })

    res.json(createdVandor)
}

export const GetVandors = async (req: Request, res: Response, next: NextFunction) => {
    
}

export const GetVandorByID = async (req: Request, res: Response, next: NextFunction) => {
    
}