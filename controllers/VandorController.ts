import { Request, Response, NextFunction } from "express";
import { EditVandorInputs, VandorLoginInputs } from "../dto";
import { createFoodInputs } from "../dto/Food.dto";
import { Food } from "../models/Food";
import { GenrateSignature, ValidatePassword } from "../utility";
import { FindVandor } from "./AdminController";
import { Multer } from "multer";


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


