import { Request, Route } from "@/types/index.ts"
import { sequelize } from "../../db_connect.ts"
import { Model, DataTypes, InferAttributes, InferCreationAttributes } from "sequelize"
import { UserModel } from "./UserModel.ts";

export interface RequestInstance extends Model<Request>, Request { }

export class RequestModel extends Model<InferAttributes<RequestInstance>, InferCreationAttributes<RequestInstance>> {
  declare public readonly id: string;
  declare public type: 'order' | 'delivery';
  declare public parcel: string;
  declare public route: Route;
  declare public description: string;
  declare public userId: string;
  declare public status: string;
  declare public createdAt: string;
  declare public receivedAt: string | null;

  static associate() {
    this.belongsTo(UserModel, { foreignKey: 'userId', targetKey: 'id' })
  }
}

RequestModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: DataTypes.STRING,
    parcel: DataTypes.STRING,
    route: DataTypes.JSON,
    description: DataTypes.STRING,
    userId: DataTypes.STRING,
    status: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    receivedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: "requests",
    modelName: "Request",
    timestamps: false
  }
)
