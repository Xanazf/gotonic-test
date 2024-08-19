import { RequestModel } from "./models/RequestModel.ts"
import { Route } from "@/types/index.ts"
import { v4 as uuidv4 } from "uuid"

RequestModel.sync();

export class RequestController {
  declare id: string;
  declare type: 'order' | 'delivery';
  declare parcel: string;
  declare route: Route;
  declare description: string;
  declare userId: string;
  declare status: string;
  declare createdAt: string;
  declare dispatchedAt: string | null;
  declare receivedAt: string | null;

  constructor(id?: string) {
    this.id = id || uuidv4()
  }

  async create(type: 'order' | 'delivery', parcel: string, route: Route, description: string, userId: string, date: string) {
    this.type = type;
    this.parcel = parcel;
    this.route = route;
    this.description = description;
    this.userId = userId;
    this.status = 'new';
    this.createdAt = new Date().toISOString();
    this.dispatchedAt = date ? new Date(date).toISOString() : null;
    this.receivedAt = null;
    try {
      const newRequest = await RequestModel.create({
        id: this.id,
        type: this.type,
        parcel: this.parcel,
        route: this.route,
        description: this.description,
        userId: this.userId,
        status: this.status,
        createdAt: this.createdAt,
        dispatchedAt: this.dispatchedAt,
        receivedAt: this.receivedAt
      })
      console.log(newRequest);
      return this.id
    } catch (err) {
      console.log(err);
      return 400
    }
  }

  async show(id?: string) {
    const request = await RequestModel.findByPk(id || this.id)
    if (request) return request;
    return 400
  }

  async change(id: string, status?: string, description?: string) {
    const request = await RequestModel.findByPk(id);
    if (request) {
      request.status = status || request.status;
      request.description = description || request.description;
      switch (status) {
        case 'received':
          request.receivedAt = new Date().toISOString();
          break;
        case 'cancelled':
          request.receivedAt = null;
          break;
      }
      await request.save()
      return 200
    }
    return 400
  }

  async remove(id: string) {
    const request = await RequestModel.findOne({ where: { id: id } });
    if (request) {
      await request.destroy();
      return 200
    }
    return 400
  }

  async getRequests(userId: string) {
    this.userId = userId;
    const requests = await RequestModel.findAll({ where: { userId: this.userId } });
    return requests;
  }
}
