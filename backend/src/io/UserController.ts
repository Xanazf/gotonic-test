import { UserModel } from "./models/UserModel.ts"
import { RequestController } from "./RequestController.ts"
import { Location } from "@/types/index.ts"
import { signJWT, verifyJWT, encrypt } from "../utils/cryptography.ts";
import { genRandomString } from "../utils/genRandomString.ts";
import { v4 as uuidv4 } from "uuid"

UserModel.sync();

const JWT_SECRET = process.env.JWT_SECRET

export class UserController {
  declare id: string;
  declare name?: string;
  declare email?: string;
  declare location?: Location;
  declare locale?: string;
  declare protected salt?: string;
  declare protected password?: string;
  declare orderIds?: string[];
  declare deliveryIds?: string[];

  constructor(id?: string) {
    this.id = id || uuidv4()
  }

  async create(name: string, email: string, location: Location, locale: string, password: string) {
    const verifiedPassword = await verifyJWT(password, JWT_SECRET!) as { payload: string }
    this.name = name
    this.email = email
    this.location = location
    this.locale = locale
    this.salt = genRandomString(16)
    this.password = await encrypt(verifiedPassword.payload, this.salt)
    this.orderIds = []
    this.deliveryIds = []
    try {
      const newUser = await UserModel.create({
        id: this.id,
        name: this.name,
        email: this.email,
        location: this.location,
        locale: this.locale,
        salt: this.salt,
        password: this.password,
        orderIds: this.orderIds,
        deliveryIds: this.deliveryIds
      });
      console.log(newUser);

      return this.getToken(this.id);
    } catch (err) {
      console.log(err);
      return 400;
    }
  }

  async showByEmail(email: string) {
    const user = await UserModel.findOne({ where: { email: email } });
    if (user) return user;
    return 400;
  }

  async show(userId?: string) {
    const user = await UserModel.findByPk(userId || this.id)
    return user;
  }

  async getRequests(userId?: string) {
    const user = await this.show(userId || this.id);
    if (!user) return 400;
    const requestController = new RequestController();
    const requests = await requestController.getRequests(user.id);
    return requests;
  }

  async addRequest(id: string, type: 'order' | 'delivery') {
    const user = await this.show();
    if (!user) return 400;
    switch (type) {
      case 'order':
        const orderIds = user.orderIds
        orderIds.push(id);
        user.update("orderIds", orderIds)
        break;
      case 'delivery':
        const deliveryIds = user.deliveryIds
        deliveryIds.push(id);
        user.update("deliveryIds", deliveryIds)
        break;
    }
    user.save()
    return 200;
  }

  async getToken(id?: string) {
    const payload = { payload: id || this.id }
    const token = signJWT(payload, JWT_SECRET!);
    return token;
  }

  async showAll() {
    const users = await UserModel.findAll();
    return users
  }
}
