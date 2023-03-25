import { VandorPayload } from "./Vendor.dto";
import {CustomerPayload} from './Customer.dto'

export type AuthPayload = VandorPayload | CustomerPayload;  