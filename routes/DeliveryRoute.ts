import express, {Request, Response, NextFunction} from 'express'
import { DeliveryUserLogIn, DeliveryUserSignUp, EditDeliveryUserProfile, GetDeliveryUserProfile, UpdateDeliveryUserStatus } from '../controllers/DeliveryController';
import { Authenticate } from '../middlewares';


const router = express.Router();


//** ------------------ Signup / Create Customer --------------------------**/
router.post('/signup', DeliveryUserSignUp)

//** ------------------ Login --------------------------**/

router.post("/login", DeliveryUserLogIn)

//authentication
router.use(Authenticate)

//** ------------------ Change service status --------------------------**/
router.put('/change-status', UpdateDeliveryUserStatus);


//** ------------------ Profile --------------------------**/

router.get('/profile', GetDeliveryUserProfile)

//** ------------------ Edit Profile --------------------------**/

router.patch('/profile', EditDeliveryUserProfile)




export { router as DeliveryRoute };