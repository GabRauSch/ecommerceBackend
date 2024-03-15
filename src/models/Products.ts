import { DataTypes, Model, Op, Optional, QueryTypes, where } from "sequelize";
import sequelize from "../config/mysql";
import { OrderBy, ProductOrderBy } from "../types/global/SQL";
import Users from "./Users";

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

    static async findAnalyticInfo(storeId: number): Promise<Product[] | null>{
        try {
            const rawQuery =  
            `SELECT 
                p.id, 
                p.name, 
                FORMAT(IFNULL(AVG(r.rating), 0), 2, 'de_DE') AS evaluation, 
                CASE 
                    WHEN p.discountId IS NOT NULL THEN 'sim' 
                    ELSE 'não' 
                END AS has_discount, 
                SUM(ps.quantity) AS qt,
                CONCAT('R$', REPLACE(FORMAT(SUM(ps.totalValue), 2, 'de_DE'), '.', '')) AS totalValue
            FROM 
                products p
            JOIN 
                purchases ps ON ps.productId = p.id
            LEFT JOIN 
                reviews r ON r.productId = p.id
            WHERE 
                p.storeId = :storeId
            GROUP BY 
                p.id, p.name, p.discountId`

            const products: Product[] = await sequelize.query(rawQuery, {
                replacements: {storeId},
                type: QueryTypes.SELECT
            })
            return products
        } catch (error) {
            console.error(error);
            return null
        }
    }
    static async findStockInfo(storeId: number): Promise<Product[] | null>{
        try {
            const rawQuery = 
            `SELECT id, name, stockQuantity, orders, 
                    (stockQuantity - orders) AS estipulated,
                    CASE 
                        WHEN (stockQuantity - orders) < orders
                        THEN 'compra'
                        ELSE 'normal'
                    END AS status
            FROM (
                SELECT p.id, p.name, p.stockQuantity,
                        COALESCE(SUM(CASE WHEN ps.delivered = 0 THEN ps.quantity ELSE 0 END), 0) AS orders
                FROM products p
                LEFT JOIN purchases ps ON p.id = ps.productId
                WHERE p.stockQuantity != 0
                AND p.storeId = :storeId
                GROUP BY p.id, p.name, p.stockQuantity
            ) AS subquery;
            `
            const products: Product[] = await sequelize.query(rawQuery, {
                replacements: {storeId},
                type: QueryTypes.SELECT
            });
            return products 
        } catch (error) {
            console.error(error);
            return null
        }
    }
    static async findAllInfo(storeId: number): Promise<any | null>{
        try {
            const rawQuery = 
            `SELECT p.id, image, p.name AS productName, unitPrice, discount, 
                (unitPrice + unitPrice * discount) AS finalPrice, stockQuantity, COUNT(ps.id) AS purchaseCount, c.name AS categoryName
                FROM products p
                JOIN discounts d ON d.id = p.discountId
                JOIN categories c ON c.id = p.categoryId
                JOIN purchases ps ON ps.productId = p.id
                WHERE p.storeId = :storeId
                GROUP BY p.id;`
            const info = await sequelize.query(rawQuery, {
                replacements: {storeId},
                type: QueryTypes.SELECT
            })
            console.log(info)
            return info
        } catch (error) {
            console.error(error);
            return null
        }
    }
    static async findProduct(id: number): Promise<Product | null>{
        try {
            const rawQuery = `SELECT p.id, p.name, p.image, p.description, p.categoryId, 
            COALESCE(p.unitPrice - p.unitPrice * d.discount / 100, p.unitPrice) AS discountPrice,
            CASE 
                WHEN d.discount IS NULL THEN NULL 
                ELSE p.unitPrice 
            END AS originalPrice
            FROM products p
            LEFT JOIN discounts d ON d.id = p.discountId
            WHERE p.id = :id`

            const product: any[] = await sequelize.query(rawQuery, {
                replacements: {id},
                type: QueryTypes.SELECT
            })

            return product[0]
        } catch (error) {
            console.error(error);
            return null
        }
    }
    static async findByName(name: string): Promise<Product | null> {
        try {
            const product = await Product.findOne({ where: { name } });
            return product;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    static async findByCategory(categoryId: number, alreadyRetrieved?: number): Promise<Product[] | null>{
        try {
            alreadyRetrieved = alreadyRetrieved ? alreadyRetrieved : 0;
            const rawQuery = 
            `SELECT 
                p.id,
                p.name, 
                p.image, 
                p.description, 
                p.categoryId, 
                COALESCE(p.unitPrice - p.unitPrice * d.discount / 100, p.unitPrice) AS discountPrice,
                CASE 
                    WHEN d.discount IS NULL THEN NULL 
                    ELSE p.unitPrice 
                END AS originalPrice
            FROM 
                products p
            LEFT JOIN discounts d ON d.id = p.discountId
            WHERE 
                p.categoryId = :categoryId
                AND p.id NOT IN (:alreadyRetrieved)
                AND p.image IS NOT null;`

            const products: Product[] = await sequelize.query(rawQuery, {
                replacements: {categoryId, alreadyRetrieved},
                type: QueryTypes.SELECT
            });
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
            SELECT p.id, p.name, p.image, p.description,
            COALESCE(p.unitPrice - p.unitPrice * d.discount / 100, p.unitPrice) AS discountPrice,
            CASE 
                WHEN d.discount IS NULL THEN NULL 
                ELSE p.unitPrice 
            END AS originalPrice, SUM(ps.quantity) AS qt
                FROM products p
            JOIN purchases ps ON ps.productId = p.id
            JOIN discounts d on d.id = p.discountId
                WHERE p.storeId = :storeId
            GROUP BY p.id
            ORDER BY qt DESC
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
            SELECT p.id, p.name, p.image, p.unitPrice, p.description, d.discount, p.categoryId, SUM(ps.quantity) AS totalQuantity
                FROM products p
            JOIN purchases ps ON ps.productId = p.id
            JOIN discounts d on d.id = p.discountId
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
    static async findByEndingDiscount(storeId: number): Promise<any[] | null>{
        try {   
            const rawQuery = `
            SELECT p.id, p.image, p.name, d.discount, d.discountName, d.endDate 
                FROM products p 
                JOIN discounts d ON d.id = p.discountId
            WHERE d.discountName IS NOT NULL
                AND d.endDate > CURRENT_DATE
                AND p.storeId = :storeId
            ORDER BY 
                d.endDate ASC
            LIMIT 4;`
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

            return purchaseInfo[0]
        } catch (error) {
            console.error(error);
            return null
        }
    }    
    static async findSuggestions(storeId: number, categoryId: number,  search: string): Promise<Product[] | null>{
        try {
            const rawQuery = 
            `SELECT p.name 
                FROM products p
                JOIN categories c ON c.id = p.categoryId
            WHERE p.storeId = :storeId 
            AND (p.categoryId = :categoryId OR c.parentCategoryId = :categoryId)
                AND p.name LIKE :search 
            LIMIT 5`
            const suggestions: Product[] = await sequelize.query(rawQuery, {
                replacements: {storeId, categoryId, search: `${search}%`},
                type: QueryTypes.SELECT
            })

            return suggestions
        } catch (error) {
            console.error(error);
            return null
        }
    }
    static async searchProducts(storeId: number, categoryId: number, search: string): Promise<Product[] | null>{
        try {
            const firstLayerQuery = `SELECT
                p.id, p.image, p.name,
                COALESCE(p.unitPrice - p.unitPrice * d.discount / 100, p.unitPrice) AS discountPrice,
                CASE 
                    WHEN d.discount IS NULL THEN NULL 
                    ELSE p.unitPrice 
                END AS originalPrice,
                p.description, p.categoryId
            FROM products p 
            LEFT JOIN discounts d on d.id = p.discountId
            JOIN categories c ON p.categoryId = c.id
                WHERE MATCH(p.name, p.DESCRIPTION) AGAINST(:search IN BOOLEAN MODE)
                AND (categoryId = :categoryId OR c.parentCategoryId = :categoryId)
                AND p.storeId = :storeId
            GROUP BY p.id
            ORDER BY MATCH(p.name, p.description) AGAINST(:search IN BOOLEAN MODE) DESC, 
                categoryId DESC ;`

            const firstLayerProducts: Product[] = await sequelize.query(
                firstLayerQuery,
                {
                    replacements: { search: `%${search}%`, categoryId, storeId },
                    type: QueryTypes.SELECT
                }
            );

            console.log(firstLayerProducts)
            if(firstLayerProducts.length > 5) return firstLayerProducts;

            const retrievedIds = firstLayerProducts.map(product => product.id);
            const searchArray = search.split(' ');
            const whereArray = searchArray.map((el, key) => {
                if (key < searchArray.length - 1)
                    return `(p.name LIKE :search${key} OR p.description LIKE :search${key}) OR`;
                else
                    return `(p.name LIKE :search${key} OR p.description LIKE :search${key})`;
            });
            if(retrievedIds.length === 0) retrievedIds.push(0)
            const secondLayerQuery =
                `SELECT 
                    p.id, p.image, p.name,
                    COALESCE(p.unitPrice - p.unitPrice * d.discount / 100, p.unitPrice) AS discountPrice,
                    CASE 
                        WHEN d.discount IS NULL THEN NULL 
                        ELSE p.unitPrice 
                    END AS originalPrice,
                    p.description, p.categoryId               
                FROM products p
                LEFT JOIN discounts d ON d.id = p.discountId
                JOIN categories c ON p.categoryId = c.id
                    WHERE (${whereArray.join(' ')})
                AND (p.categoryId = :categoryId OR c.parentCategoryId = :categoryId)
                AND p.storeId = :storeId
                AND p.id NOT IN (${retrievedIds.map((el) => el).join(', ')});`;

            const replacements: any = {};
            searchArray.forEach((el, key) => {
                replacements[`search${key}`] = `%${el}%`;
            });
            const secondLayerProducts: Product[] = await sequelize.query(
                secondLayerQuery,
                {
                    replacements: { ...replacements, categoryId, storeId},
                    type: QueryTypes.SELECT
                }
            );

            if(secondLayerProducts.length + firstLayerProducts.length > 5) return [...firstLayerProducts, ...secondLayerProducts];

            const microStringArray = searchArray.map((el, key)=>{
                const midPoint = Math.floor(el.length/2);
                const firstHalf = el.substring(0,midPoint);
                const secondHalf = el.substring(midPoint);
                return [firstHalf, secondHalf]
            })
            const microArrayFlaten = microStringArray.flatMap(el=>el);
            const whereThird = microArrayFlaten.map((el, key) => {
                if (key < microArrayFlaten.length - 1)
                    return `(p.name LIKE :search${key} OR p.description LIKE :search${key}) OR`;
                else
                    return `(p.name LIKE :search${key} OR p.description LIKE :search${key})`;
            });

            const thirdLayerQuery = 
            `SELECT
                p.id, p.image, p.name,
                COALESCE(p.unitPrice - p.unitPrice * d.discount / 100, p.unitPrice) AS discountPrice,
                CASE 
                    WHEN d.discount IS NULL THEN NULL 
                    ELSE p.unitPrice 
                END AS originalPrice,
                p.description, p.categoryId    
            FROM products p
            LEFT JOIN discounts d ON d.id = p.discountId
            JOIN categories c on p.categoryId = c.id
                WHERE (${whereThird.join(' ')})
            AND (p.categoryId = :categoryId OR c.parentCategoryId = :categoryId)
            AND p.storeId = :storeId
            AND p.id NOT IN (${retrievedIds.map((el) => el).join(', ')});`;
            
            const replacementsThird: any = {}
            microArrayFlaten.forEach((el, key) => {
                replacementsThird[`search${key}`] = `%${el}%`;
            });
            const thirdLayerProducts: Product[] = await sequelize.query(
                thirdLayerQuery,
                {
                    replacements: { ...replacementsThird, categoryId, storeId},
                    type: QueryTypes.SELECT
                }
            );

            return [...firstLayerProducts, ...secondLayerProducts, ...thirdLayerProducts]     
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
