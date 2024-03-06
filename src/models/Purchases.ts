import { DataTypes, Model, Optional, QueryTypes } from "sequelize";
import sequelize from "../config/mysql";
import { DatesObject } from "../types/global/Dates";

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
            `SELECT 
                IFNULL(COUNT(ps.id), 0) AS purchasesCount, 
                IFNULL(SUM(ps.totalValue), 0) AS totalValue, 
                IFNULL(COUNT(ps.userId), 0) AS clientsCount, 
                IFNULL(COUNT(CASE WHEN ps.createdAt >= :startDate AND ps.createdAt <= :endDate THEN ps.userId END), 0) AS clientsCountCurrentMonth, 
                IFNULL(SUM(CASE WHEN ps.createdAt >= :startDate AND ps.createdAt <= :endDate THEN ps.totalValue END), 0) AS totalValueCurrentMonth, 
                IFNULL(COUNT(CASE WHEN ps.createdAt >= :pastMonthStartDate AND ps.createdAt <= :pastMonthEndDate THEN ps.userId END), 0) AS clientsCountPastMonth, 
                IFNULL(SUM(CASE WHEN ps.createdAt >= :pastMonthStartDate AND ps.createdAt <= :pastMonthEndDate THEN ps.totalValue END), 0) AS totalValuePastMonth,
                CONCAT(FORMAT(IFNULL((SUM(CASE WHEN ps.createdAt >= :startDate 
                    AND ps.createdAt <= :endDate THEN ps.totalValue END) - SUM(CASE WHEN ps.createdAt >= :pastMonthStartDate 
                    AND ps.createdAt <= :pastMonthEndDate THEN ps.totalValue END)) / SUM(CASE WHEN ps.createdAt >= :pastMonthStartDate 
                    AND ps.createdAt <= :pastMonthEndDate THEN ps.totalValue END) * 100, 0), 2), '%') AS totalValueComparisonPercentage

            FROM purchases ps
            JOIN products p ON ps.productId = p.id
            WHERE p.storeId = :storeId;`;
    
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

    static async findAnalyticInfo(storeId: number, order: string, orderBy: string): Promise<any | null>{
        try {
            const rawQuery = 
            `SELECT u.name, SUM(ps.totalValue) AS totalValue, COUNT(ps.id) AS timesPurchased
                FROM purchases ps
            JOIN users u ON ps.userId = u.id
            JOIN products p ON p.id = ps.productId
            WHERE p.storeId = :storeId
                GROUP BY userId
                ORDER BY  ${orderBy} ${order}
                LIMIT 10`
            const clients = await sequelize.query(rawQuery, {
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
