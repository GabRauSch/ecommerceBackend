import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/mysql";
import Product from "./Products";

interface DiscountAttributes {
    id: number;
    storeId: number;
    discount: number;
    discountName: string;
    endDate: Date;
    createdAt: Date;
}

interface DiscountCreationAttributes extends Optional<DiscountAttributes, 'id' | 'createdAt'> {}

class Discount extends Model<DiscountAttributes, DiscountCreationAttributes> implements DiscountAttributes {
    public id!: number;
    public storeId!: number;
    public discount!: number;
    public discountName!: string;
    public endDate!: Date;
    public createdAt!: Date;
}

Discount.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    storeId: {
        type:DataTypes.INTEGER,
        allowNull: false
    },
    discount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    discountName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'Discount',
    tableName: 'discounts',
    timestamps: false
});

export default Discount;
