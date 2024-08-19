import { Location, User } from "@/types/index.ts"
import { sequelize } from "../../db_connect.ts"
import { Model, DataTypes, InferAttributes, InferCreationAttributes } from "sequelize"

export interface UserInstance extends Model<User>, User { }

export class UserModel extends Model<InferAttributes<UserInstance>, InferCreationAttributes<UserInstance>> {
  declare public readonly id: string;
  declare public name: string;
  declare public email: string;
  declare public location: Location;
  declare public locale: string;
  declare public salt: string;
  declare public password: string;
  declare public orderIds: string[];
  declare public deliveryIds: string[];
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    location: DataTypes.JSON,
    locale: DataTypes.STRING,
    salt: DataTypes.STRING,
    password: DataTypes.STRING,
    orderIds: DataTypes.JSON,
    deliveryIds: DataTypes.JSON
  },
  {
    sequelize,
    tableName: "users",
    modelName: "User",
    timestamps: false
  }
)
