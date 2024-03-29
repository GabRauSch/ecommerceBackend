import { DataTypes, Model, Optional, QueryTypes } from "sequelize";
import sequelize from "../config/mysql";

interface ReviewAttributes {
    id: number;
    userId: number;
    productId: number;
    rating: number;
    comment: string;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
    public id!: number;
    public userId!: number;
    public productId!: number;
    public rating!: number;
    public comment!: string;

    static async findByProductId(productId: number): Promise<any[] | null>{
        try {
            const rawQuery = 
                `SELECT u.name, r.rating, r.comment,
                TIMESTAMPDIFF(DAY, MIN(r.createdAt), NOW()) AS createdAt
                FROM reviews r
                    JOIN users u ON r.userId = u.id
                WHERE r.productId = :productId
                GROUP BY r.id;` 

            const reviews: Review[] = await sequelize.query(rawQuery, {
                replacements: {productId},
                type: QueryTypes.SELECT
            })

            return reviews
        } catch (error) {
            console.error(error);
            return null
        }

    }
}

Review.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: true
});

export default Review;
