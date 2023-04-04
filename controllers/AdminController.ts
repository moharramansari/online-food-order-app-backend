import { Request,Response, NextFunction } from "express";
import { CreateVendorInput } from "../dto";
import { Vandor } from "../models";
import { GenratePassword, GenrateSalt } from "../utility";


export const FindVendor = async (id: string | undefined, email?: string) => {
    if (email) {
        return await Vandor.findOne({email: email})
    } else {
        return await Vandor.findById(id)
    }
}


export const createVandor = async (req: Request, res: Response, next: NextFunction) => {
    const {name, address, pincode, foodType, email, password, ownerName, phone} = <CreateVandorInput>req.body;

    const existingVandor = await FindVandor('', email);

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
        coverImages: [],
        foods : []
    })

    res.json(createdVandor)
}

export const GetVandors = async (req: Request, res: Response, next: NextFunction) => {
    const vandors = await Vandor.find();

    if (vandors !== null) {
        return res.json(vandors)
    }

    return res.json({"message" : "Vandors data not available"})
}

export const GetVandorByID = async (req: Request, res: Response, next: NextFunction) => {
    const vandorId = req.params.id;

    const vandor = await FindVandor(vandorId);

    if (vandor !== null) {
        return res.json(vandor)
    }

    return res.json({"message" : "Vandor data not available"})
}