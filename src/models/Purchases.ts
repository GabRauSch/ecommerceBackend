import { DataTypes, Model, Optional, QueryTypes } from "sequelize";
import sequelize from "../config/mysql";
import { DatesObject } from "../types/global/Dates";
import Users from "./Users";

interface PurchaseAttributes {
    id: number;
    productId: number,
    productName: string;
    productImage: string;
    quantity: number;
    delivered: number;
    totalValue: number;
    userId: number;
    aproved: number;
    error: string | null
}

interface PurchaseCreationAttributes extends Optional<PurchaseAttributes, 'id'> {}

class Purchase extends Model<PurchaseAttributes, PurchaseCreationAttributes> implements PurchaseAttributes {
    public id!: number;
    public productId!: number;
    public productName!: string;
    public productImage!: string;
    public quantity!: number;
    public delivered!: number;
    public totalValue!: number;
    public userId!: number;
    public aproved!: number;
    public error!: string | null

    static async findAllOverViewInfo(storeId: number): Promise<any | null>{
        try {
            const rawQuery = 
            `SELECT Sum(ps.totalValue) AS totalValue, COUNT(ps.id) AS purchasesCount, COUNT(distinct ps.userId) AS totalClients
            FROM purchases ps
            JOIN products p ON p.id = ps.productId
            WHERE p.storeId = :storeId`

            const overview = await sequelize.query(rawQuery, {
                replacements: {storeId},
                type: QueryTypes.SELECT
            })
            return overview[0]
        } catch (error) {
            console.error(error);
            return null
        }
    }

    static async findOverviewInfo(storeId: number, datesObject: DatesObject): Promise<any | null>{
        try {
            console.log(datesObject)
            const rawQuery = 
            `WITH MonthlyData AS (
                SELECT 
                    ps.id,
                    ps.totalValue,
                    ps.userId,
                    CASE WHEN ps.createdAt BETWEEN :startDate AND :endDate THEN ps.totalValue ELSE 0 END AS currentMonthTotalValue,
                    CASE WHEN ps.createdAt BETWEEN :startDate AND :endDate THEN ps.userId END AS currentMonthUserId,
                    CASE WHEN ps.createdAt BETWEEN :pastMonthStartDate AND :pastMonthEndDate THEN ps.totalValue ELSE 0 END AS pastMonthTotalValue,
                    CASE WHEN ps.createdAt BETWEEN :pastMonthStartDate AND :pastMonthEndDate THEN ps.userId END AS pastMonthUserId
                FROM 
                    purchases ps
                JOIN 
                    products p ON ps.productId = p.id
                WHERE 
                    p.storeId = :storeId
            )
            
            SELECT 
                COUNT(id) AS purchasesCount, 
                SUM(totalValue) AS totalValue, 
                COUNT(DISTINCT userId) AS totalClients, 
                SUM(currentMonthTotalValue) AS totalValueCurrentMonth, 
                COUNT(DISTINCT currentMonthUserId) AS clientsCountCurrentMonth, 
                SUM(pastMonthTotalValue) AS totalValuePastMonth, 
                COUNT(DISTINCT pastMonthUserId) AS clientsCountPastMonth, 
                CONCAT(FORMAT(IFNULL((SUM(currentMonthTotalValue) - SUM(pastMonthTotalValue)) / NULLIF(SUM(pastMonthTotalValue), 0) * 100, 0), 2), '%') AS pastPeriod, 
                IFNULL((COUNT(DISTINCT currentMonthUserId) - COUNT(DISTINCT pastMonthUserId)), 0) AS newClients
            FROM 
                MonthlyData;
            ;
        `;
    
            const data = await sequelize.query(rawQuery, {
                replacements: {storeId, ...datesObject},
                type: QueryTypes.SELECT
            })
    
            return data[0]
        } catch (error) {
            console.error(error)
            return null
        }
    }

    static async findAnalyticInfo(storeId: number): Promise<Users[] | null>{
        try {
            const rawQuery = 
            `SELECT u.id, u.name, 
            COUNT(ps.id) AS timesPurchased,
            CONCAT('R$', REPLACE(FORMAT(SUM(ps.totalValue), 2, 'de_DE'), '.', '')) AS totalValue
                FROM purchases ps
            JOIN users u ON ps.userId = u.id
            JOIN products p ON p.id = ps.productId
            WHERE p.storeId = :storeId
                GROUP BY userId`
            const clients: Users[] = await sequelize.query(rawQuery, {
                replacements: {storeId},
                type: QueryTypes.SELECT
            })

            return clients
        } catch (error) {
            console.error(error);
            return null
        }
    }
    static async findSales(storeId: number): Promise<any|null>{
        try {
            const rawQuery = 
            `SELECT 
                ps.id, u.name AS client, p.name AS product, 
                CONCAT('R$', REPLACE(FORMAT(SUM(ps.totalValue), 2, 'de_DE'), '.', '')) AS totalValue, 
                p.stockQuantity,
                (case when ps.error IS NOT NULL then 'Com erro'  when ps.delivered = 0 then 'Pendente de entrega' ELSE 'Entregue' END) AS status,
                (case when ps.error IS NOT NULL then ps.error 
                when p.stockQuantity = 0 then 'Sem itens no estoque' when ps.delivered = 0 then 'Não entregue' ELSE '' END) AS info
            FROM purchases ps
            JOIN products p ON p.id = ps.productId
            JOIN users u ON u.id = ps.userId
            WHERE p.storeId = 1
            GROUP BY ps.id`
            const sales: any = await sequelize.query(rawQuery, {
                replacements: {storeId},
                type: QueryTypes.SELECT
            })
            return sales
        } catch (error) {
            console.error(error);
            return null
        }
    }
    static async findAnalyticSales(storeId: number): Promise<any | null>{
        try {
            const rawQuery = 
            `SELECT 
                COUNT(ps.id) as purchasesCount, 
                COUNT(CASE WHEN ps.delivered = 1 THEN 1 END) AS delivered,
                COUNT(case when ps.delivered = 0 then 1 END) AS pendentDelivery,
                COUNT(case when ps.aproved = 0 then 1 end) AS aproved,
                COUNT(ps.error) AS error
            FROM 
                purchases ps
            JOIN 
                products p ON p.id = ps.productId
            WHERE 
                p.storeId = :storeId;`
            const sales: any = await sequelize.query(rawQuery, {
                replacements: {storeId},
                type: QueryTypes.SELECT
            })
            return sales[0]
        } catch (error) {
            console.error(error);
            return null
        }
    }
}

Purchase.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId: {
        type: DataTypes.INTEGER,
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
    delivered: {
        type: DataTypes.TINYINT,
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
    aproved: {
        type: DataTypes.TINYINT,
        allowNull: false
    },
    error: {
        type: DataTypes.STRING
    }
}, {
    sequelize,
    modelName: 'Purchase',
    tableName: 'purchases',
    timestamps: true
});

export default Purchase;
