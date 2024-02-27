import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/mysql";

interface UserAttributes {
    id: number;
    name: string;
    email: string;
    cpf: string;
    location: any; 
    passwordHash: string;
    confirmationCode: string;
    temporaryUser: number;
    birthday: Date;
    role: string;
    createdAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: number;
    public name!: string;
    public email!: string;
    public cpf!: string;
    public location!: any;
    public passwordHash!: string;
    public confirmationCode!: string;
    public temporaryUser!: number;
    public birthday!: Date;
    public role!: string;
    public createdAt!: Date;
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    cpf: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    location: {
        type: DataTypes.GEOMETRY('POINT'),
        allowNull: false
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    confirmationCode: {
        type: DataTypes.STRING,
    },
    temporaryUser: {
        type: DataTypes.INTEGER,
    },
    birthday: {
        type: DataTypes.DATE,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false
});

export default User;
