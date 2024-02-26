import { DataTypes, Model, Optional, QueryTypes, col } from "sequelize";
import sequelize from "../config/mysql";
import { Op } from "sequelize";

export interface ProductsAttributes {
    id: number,
    name: string,
    companyId: number,
    categoryId: number,
    originalUnitPrice: number,
}

interface ProductCreateAttributes extends Optional<ProductsAttributes, 'id'>{};
interface ProductCreationAttributes {email: string, passwordHash: string, confirmationCode: string}

class Product extends Model<ProductsAttributes, ProductCreationAttributes> implements ProductsAttributes{
    public id!: number;
    public email!: string;
    public confirmationCode!: string
    public passwordHash!: string
    public name!: string;
    
    static async ProductByName(name: string): Promise<Product | null>{
        try {
            const user = Product.findOne({
                where: {
                    name
                }
            })
            return user
        } catch (e) {
            console.error(e);
            return null
        }
    }
}

Product.init({
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    confirmationCode: {
        type: DataTypes.STRING,
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        unique: true
    }
}, {
    sequelize, 
    tableName: 'products',
    timestamps: false
});


export default Product;