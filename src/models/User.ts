import { DataTypes, Model, Optional, QueryTypes, col } from "sequelize";
import sequelize from "../config/mysql";
import { Op } from "sequelize";

export interface UsersAttributes {
    id: number,
    email: string,
    confirmationCode: string,
    passwordHash: string,
    name: string,
}

interface UsersCreateAttributes extends Optional<UsersAttributes, 'id'>{};
interface UserCreationAttributes {email: string, passwordHash: string, confirmationCode: string}

class User extends Model<UsersAttributes, UserCreationAttributes> implements UsersAttributes{
    public id!: number;
    public email!: string;
    public confirmationCode!: string
    public passwordHash!: string
    public name!: string;
    
    static async userByName(name: string): Promise<User | null>{
        try {
            const user = User.findOne({
                where: {
                    name
                }
            })
            return user
        } catch (e) {
            console.error(e);
            return null
        }
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    confirmationCode: {
        type: DataTypes.STRING,
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        unique: true
    }
}, {
    sequelize, 
    tableName: 'users',
    timestamps: false
});


export default User;