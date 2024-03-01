import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/mysql";

interface CategoryAttributes {
    id: number;
    name: string;
    parentCategoryId: number;
    storeId: number;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
    public id!: number;
    public name!: string;
    public parentCategoryId!: number;
    public storeId!: number;
}

Category.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parentCategoryId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    storeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: false
});

export default Category;
