'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Likes extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.Users, {
                targetKey: 'userId',
                foreignKey: 'UserId',
            });

            this.belongsTo(models.Posts, {
                targetKey: 'postId',
                foreignKey: 'PostId',
            });
        }
    }
    Likes.init(
        {
            likeId: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            UserId: {
                allowNull: false, // NOT NULL
                type: DataTypes.INTEGER,
                references: {
                    model: 'Users', // Users 모델을 참조합니다.
                    key: 'userId', // Users 모델의 userId를 참조합니다.
                },
                onDelete: 'CASCADE', // 만약 Users 모델의 userId가 삭제되면, Likes 모델의 데이터가 삭제됩니다.
            },
            PostId: {
                allowNull: false, // NOT NULL
                type: DataTypes.INTEGER,
                references: {
                    model: 'Posts', // Posts 모델을 참조합니다.
                    key: 'postId', // Posts 모델의 postId를 참조합니다.
                },
                onDelete: 'CASCADE', // 만약 Posts 모델의 postId가 삭제되면, Likes 모델의 데이터가 삭제됩니다.
            },
            Nickname: {
                allowNull: false,
                type: DataTypes.STRING,
                references: {
                    model: 'Users',
                    key: 'nickname',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
        },
        {
            sequelize,
            modelName: 'Likes',
        }
    );
    return Likes;
};
