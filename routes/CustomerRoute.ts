import express, {Request, Response, NextFunction} from 'express'
import { CustomerLogIn, CustomerSignUp, CustomerVerify, EditCustomerProfile, GetCustomerProfile, RequestOtp } from '../controllers/CustomerController';
import { Authenticate } from '../middlewares';


const router = express.Router();


//** ------------------ Signup / Create Customer --------------------------**/
router.post('/signup', CustomerSignUp)

//** ------------------ Login --------------------------**/

router.post("/login", CustomerLogIn)

//authentication
router.use(Authenticate)

//** ------------------ Verify Customer Account --------------------------**/

router.patch('/verify', CustomerVerify)

//** ------------------ OTP / Requesting OTP --------------------------**/

router.get('/otp', RequestOtp)

//** ------------------ Profile --------------------------**/

router.get('/profile', GetCustomerProfile)

//** ------------------ Edit Profile --------------------------**/

router.patch('/profile', EditCustomerProfile)

//Cart

//Payment

//Order
router.post('/create-order')
router.get('/orders')
router.get('/order/:id')

export { router as CustomerRoute };