import { DataTypes, Model, Optional, QueryTypes } from "sequelize";
import sequelize from "../config/mysql";

interface ProductAttributes {
    id: number;
    name: string;
    categoryId: number;
    description: string;
    storeId: number;
    stockQuantity: number;
    unitPrice: number;
    discount: number;
    discountFinishTime: Date;
    recommended: boolean;
    createdAt: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    public id!: number;
    public name!: string;
    public categoryId!: number;
    public description!: string;
    public storeId!: number;
    public stockQuantity!: number;
    public unitPrice!: number;
    public discount!: number;
    public discountFinishTime!: Date;
    public recommended!: boolean;
    public createdAt!: Date;

    static async findByName(name: string): Promise<Product | null> {
        try {
            const product = await Product.findOne({ where: { name } });
            return product;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    static async findByCategory(categoryId: number): Promise<Product[] | null>{
        try {
            const products = await Product.findAll({
                where: {categoryId}
            })
            return products           
        } catch (error) {
            console.error(error);
            return null;            
        }
    }
    static async findByCategoryAndChildren(categoryId: number): Promise<Product[] | null>{
        try {
            const rawQUery = 
            `SELECT p.* from products p
                JOIN categories c ON c.id = p.categoryId
            WHERE p.categoryId = :categoryId 
                OR c.parentCategoryId = :categoryId`;

            const products: Product[] = await sequelize.query(rawQUery, {
                replacements: {categoryId},
                type: QueryTypes.SELECT
            })
            return products
        } catch (error) {
            console.error(error);
            return null;            
        }
    }
}

Product.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    stockQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unitPrice: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    discount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    discountFinishTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    recommended: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: false
});

export default Product;
