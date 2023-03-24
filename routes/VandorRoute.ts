import express, {Request, Response,NextFunction} from 'express'
import { AddFood, GetCurrentOrders, GetFoods, GetOrderDetails, GetOrders, GetVandorProfile, ProcessOrder, UpdateVandorProfile, UpdateVandorService, VandorLogin } from '../controllers'
import { Authenticate } from '../middlewares';
import multer from 'multer';

const router = express.Router()


const imageStorage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString()+'_'+file.originalname)
    }
})

const images = multer({storage: imageStorage}).array('images', 10)



router.post('/login', VandorLogin)

router.use(Authenticate);
router.get('/profile',GetVandorProfile)
router.patch('/profile', UpdateVandorProfile)
router.patch('/service', UpdateVandorService)

//foods
router.post('/food',images, AddFood)
router.get('/foods', images, GetFoods)

//Orders
router.get('/orders', GetCurrentOrders);
router.get('/order/:id', ProcessOrder)
router.get('/orders', GetOrderDetails)

router.get('/', (req: Request, res: Response, next: NextFunction) => {

    
    res.json({message:"Hello from vandor"})
})

export {router as VandorRoute}  