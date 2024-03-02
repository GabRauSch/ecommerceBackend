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

    static async findByCategory(categoryId: number, attributes?: Partial<ProductAttributes>[]): Promise<Product[] | null>{
        try {
            let options: any = { where: { categoryId } };
            if (attributes && attributes.length > 0) {
                options.attributes = attributes.map(attr => attr as Partial<ProductAttributes>);
            }
    
            const products = await Product.findAll(options);
            return products;        
        } catch (error) {
            console.error(error);
            return null;            
        }
    }
    static async findByCategoryAndChildren(categoryId: number, attributes?: (keyof ProductAttributes)[]): Promise<Product[] | null>{
        try {
            let selectClause = 'p.*'; 
            if (attributes && attributes.length > 0) {
                const availableAttributes = Object.keys(Product.rawAttributes);
                const includedAttributes = attributes.filter(attr => availableAttributes.includes(attr as string));
                if (includedAttributes.length > 0) {
                    selectClause = includedAttributes.map(attr => `p.${attr}`).join(',');
                }
            }
            const rawQuery =
                `SELECT ${selectClause} FROM products p
                JOIN categories c ON c.id = p.categoryId
                WHERE p.categoryId = :categoryId OR c.parentCategoryId = :categoryId`;

            const products: Product[] = await sequelize.query(rawQuery, {
                replacements: { categoryId },
                type: QueryTypes.SELECT
            })
            return products
        } catch (error) {
            console.error(error);
            return null;            
        }
    }
    static async findMostPurchasedItems(storeId: number, amount: number): Promise<Product[]| null>{
        try {
            const rawQuery = `
                SELECT p.id, SUM(ps.quantity)  
                FROM products p
                JOIN purchases ps ON ps.productId = p.id
                    WHERE p.storeId = :storeId
                GROUP BY p.id
                HAVING SUM(ps.quantity) > 
                    (SELECT AVG(qt) 
                        FROM (SELECT SUM(ps.quantity) AS qt 
                            FROM products p 
                            JOIN purchases ps ON ps.productId = p.id 
                                WHERE p.storeId = :storeId GROUP BY p.id) AS subquery)`

            const products: Product[] = await sequelize.query(rawQuery, {
                replacements: {storeId, amount},
                type: QueryTypes.SELECT,
            })

            return products
        } catch (error) {
            console.error(error);
            return null;            
        }
    }

    static async applySingleDiscount(product: Product, discount: number, discountFinishTime: Date): Promise<boolean>{
        try {
            const updating = await product.update({    
                discount,
                discountFinishTime
            });
            
            return Boolean(updating)
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    static async applyBatchDiscount(productIds: number[], discount: number, discountFinishTime: Date): Promise<boolean>{
        try {
            const rawQuery = `
                UPDATE products 
                SET discount = :discount, 
                    discountFinishTime = :discountFinishTime 
                WHERE id IN (:productIds)
            `
            const updating = sequelize.query(rawQuery, {
                    replacements: {discount, discountFinishTime, productIds},
                    type: QueryTypes.UPDATE
            })

            return Boolean(updating)
        } catch (error) {
            console.error(error);
            return false;
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
