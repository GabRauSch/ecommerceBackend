import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/mysql";

interface IncomeAttributes {
    id: number;
    storeId: number;
    userId: number;
    productName: string;
    quantity: number;
    unitPriceSold: number;
    saleDate: Date;
}

interface IncomeCreationAttributes extends Optional<IncomeAttributes, 'id'> {}

class Income extends Model<IncomeAttributes, IncomeCreationAttributes> implements IncomeAttributes {
    public id!: number;
    public storeId!: number;
    public userId!: number;
    public productName!: string;
    public quantity!: number;
    public unitPriceSold!: number;
    public saleDate!: Date;
}

Income.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unitPriceSold: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    saleDate: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Income',
    tableName: 'incomes',
    timestamps: false
});

export default Income;
