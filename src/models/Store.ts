import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/mysql";

interface StoreAttributes {
    id: number;
    name: string;
    ownerId: number;
    location: string;
}

interface StoreCreationAttributes extends Optional<StoreAttributes, 'id'> {}

class Store extends Model<StoreAttributes, StoreCreationAttributes> implements StoreAttributes {
    public id!: number;
    public name!: string;
    public ownerId!: number;
    public location!: string;

    static async findByName(name: string): Promise<Store | null> {
        try {
            const store = await Store.findOne({ where: { name } });
            console.log(store?.id)
            return store;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}

Store.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Store',
    tableName: 'stores',
    timestamps: false
});

export default Store;
