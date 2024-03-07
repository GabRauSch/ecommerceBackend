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

    static async findOverviewInfo(storeId: number, datesObject: DatesObject): Promise<any | null>{
        try {
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
                COUNT(DISTINCT userId) AS clientsCount, 
                SUM(currentMonthTotalValue) AS totalValueCurrentMonth, 
                COUNT(DISTINCT currentMonthUserId) AS clientsCountCurrentMonth, 
                SUM(pastMonthTotalValue) AS totalValuePastMonth, 
                COUNT(DISTINCT pastMonthUserId) AS clientsCountPastMonth, 
                CONCAT(FORMAT(IFNULL((SUM(currentMonthTotalValue) - SUM(pastMonthTotalValue)) / NULLIF(SUM(pastMonthTotalValue), 0) * 100, 0), 2), '%') AS totalValueComparisonPercentage, 
                CONCAT(FORMAT(IFNULL((COUNT(DISTINCT currentMonthUserId) - COUNT(DISTINCT pastMonthUserId)) / NULLIF(COUNT(DISTINCT pastMonthUserId), 0) * 100, 0), 2), '%') AS clientsComparisonPercentage
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

    static async findAnalyticInfo(storeId: number, order: string, orderBy: string): Promise<Users[] | null>{
        try {
            const rawQuery = 
            `SELECT u.id, u.name, 
            COUNT(ps.id) AS timesPurchased,
            CONCAT('R$', FORMAT(SUM(ps.totalValue), 2)) AS totalValue
                FROM purchases ps
            JOIN users u ON ps.userId = u.id
            JOIN products p ON p.id = ps.productId
            WHERE p.storeId = :storeId
                GROUP BY userId
                ORDER BY  ${orderBy} ${order}
                LIMIT 10`
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
    timestamps: true
});

export default Purchase;
