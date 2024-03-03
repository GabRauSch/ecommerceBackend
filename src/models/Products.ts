import { DataTypes, Model, Optional, QueryTypes, where } from "sequelize";
import sequelize from "../config/mysql";

interface ProductAttributes {
    id: number;
    name: string;
    image: string;
    categoryId: number;
    description: string;
    storeId: number;
    stockQuantity: number;
    unitPrice: number;
    discountId: number;
    recommended: boolean;
    createdAt: Date;
}

interface ProductCreationAttributes extends Optional<ProductAttributes, 'id'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    public id!: number;
    public name!: string;
    public image!: string;
    public categoryId!: number;
    public description!: string;
    public storeId!: number;
    public stockQuantity!: number;
    public unitPrice!: number;
    public discountId!: number;
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
    static async findMostPurchasedItems(storeId: number): Promise<Product[]| null>{
        try {
            const rawQuery = `
            SELECT p.id, p.name, p.unitPrice, p.description, p.discount, SUM(ps.quantity) AS qt
                FROM products p
            JOIN purchases ps ON ps.productId = p.id
                WHERE p.storeId = :storeId
            GROUP BY p.id
            ORDER BY qt desc
                LIMIT 10`

            const products: Product[] = await sequelize.query(rawQuery, {
                replacements: {storeId},
                type: QueryTypes.SELECT,
            })

            return products
        } catch (error) {
            console.error(error);
            return null;            
        }
    }

    static async findMostPurchasedItemByCategories(storeId: number): Promise<Product[]| null>{
        try {
            const rawQuery = `
            SELECT p.id, p.name, p.unitPrice, p.description, p.discount, p.categoryId, SUM(ps.quantity) AS totalQuantity
                FROM products p
            JOIN purchases ps ON ps.productId = p.id
                WHERE p.storeId = 1
                GROUP BY p.id
            HAVING totalQuantity = (
                SELECT MAX(qt)
                    FROM (
                        SELECT p.categoryId, SUM(quantity) AS qt
                        FROM products p
                        JOIN purchases ps ON ps.productId = p.id
                        WHERE p.storeId = 1
                        GROUP BY p.id, p.categoryId
                    ) AS maxQuantities
                    WHERE maxQuantities.categoryId = p.categoryId
                )
                LIMIT 3;`

            const products: Product[] = await sequelize.query(rawQuery, {
                replacements: {storeId},
                type: QueryTypes.SELECT,
            })

            return products
        } catch (error) {
            console.error(error);
            return null;            
        }
    }
    static async applySingleDiscount(discountId: number, productId: number): Promise<boolean>{
        try {
            const updating = await Product.update({    
                discountId
            }, {
                where: {
                    id: productId
                }
            });
            
            return Boolean(updating)
        } catch (error) {
            console.error(error);
            return false;
        }
    }
    static async applyBatchDiscount(productIds: number[], discountId: number, discountFinishTime: Date): Promise<boolean>{
        try {
            const rawQuery = `
                UPDATE products 
                SET discountId = :discountId
                WHERE id IN (:productIds)
            `
            const updating = sequelize.query(rawQuery, {
                    replacements: {discountId, discountFinishTime, productIds},
                    type: QueryTypes.UPDATE
            })

            return Boolean(updating)
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static async findByEndingDiscount(storeId: number): Promise<Product[] | null>{
        try {   
            const rawQuery = `
            SELECT p.image, p.name, d.discount, d.discountName, d.endDate FROM products p 
                JOIN discounts d ON d.id = p.discountId
            WHERE discountName IS NOT NULL
                AND storeId = :storeId
                ORDER BY endDate asc
                LIMIT 4
            `
            const products: Product[] = await sequelize.query(rawQuery, {
                replacements: {storeId},
                type: QueryTypes.SELECT
            })

            return products
        } catch (error) {
            console.error(error);
            return null;            
        }
    }


    static async findInfoForPurchase(productId: number): Promise<any| null>{
        try {
            const rawQuery = 
            `SELECT p.name, p.image, p.unitPrice, d.discount  
            FROM products p
                JOIN discounts d ON d.id = p.discountId
            WHERE p.id = :productId`
            
            const purchaseInfo = await sequelize.query(rawQuery, {
                replacements: {productId},
                type: QueryTypes.SELECT
            })

            return purchaseInfo
        } catch (error) {
            console.error(error);
            return null
        }
    }

    static async searchProducts(search: string, categoryId: number): Promise<Product[] | null>{
        try {
            const firstLayerQuery = `SELECT * FROM products
                WHERE MATCH(name, description) AGAINST(':search' IN BOOLEAN MODE)
                AND categoryId = :categoryId`

            const firstLayerProducts: Product[] = await sequelize.query(
                firstLayerQuery,
                {
                    replacements: { search: `%${search}%` },
                    type: QueryTypes.SELECT
                }
            );

            if(firstLayerQuery.length !== 0) return firstLayerProducts;

            const searchArray = search.split(' ');
            const whereArray = searchArray.map((el, key) => {
                if (key < searchArray.length - 1)
                    return `(name LIKE :search${key} OR description LIKE :search${key}) OR`;
                else
                    return `(name LIKE :search${key} OR description LIKE :search${key});`;
            });
            
            const secondLayerQuery = `SELECT * FROM products 
                WHERE (${whereArray.join(' ')})
                AND categoryId = :categoryId`;
            
            const replacements: any = {};
            searchArray.forEach((el, key) => {
                replacements[`search${key}`] = `%${el}%`;
            });
            
            const secondLayerProducts: Product[] = await sequelize.query(
                secondLayerQuery,
                {
                    replacements: { ...replacements, categoryId: categoryId },
                    type: QueryTypes.SELECT
                }
            );

            if(secondLayerProducts.length !== 0) return secondLayerProducts

            const microStringArray = searchArray.map((el, key)=>{
                const midPoint = Math.floor(el.length/2);
                const firstHalf = el.substring(0,midPoint);
                const secondHalf = el.substring(midPoint);
                
            })
            const thirdLayerQuery = `SELECT * FROM products 
            WHERE (${microStringArray.join(' ')})
            AND categoryid = :categoryId` 
        
            const thirdLayerProducts: Product[] = await sequelize.query(
                thirdLayerQuery,
                {
                    replacements: { search: `%${search}%` },
                    type: QueryTypes.SELECT
                }
            );

            return thirdLayerProducts        
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
    image:{
        type: DataTypes.STRING,
        allowNull: false
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
    discountId: {
        type: DataTypes.INTEGER,
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
