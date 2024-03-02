import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/mysql";

interface PurchaseAttributes {
    id: number;
    productId: number,
    productName: string;
    productImage: string;
    quantity: number;
    totalValue: number;
    userId: number;
    pendent: boolean;
}

interface PurchaseCreationAttributes extends Optional<PurchaseAttributes, 'id'> {}

class Purchase extends Model<PurchaseAttributes, PurchaseCreationAttributes> implements PurchaseAttributes {
    public id!: number;
    public productId!: number;
    public productName!: string;
    public productImage!: string;
    public quantity!: number;
    public totalValue!: number;
    public userId!: number;
    public pendent!: boolean;
}

Purchase.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.NUMBER,
        allowNull: true
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productImage: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalValue: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pendent: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Purchase',
    tableName: 'purchases',
    timestamps: false
});

export default Purchase;
