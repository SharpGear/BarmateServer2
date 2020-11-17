/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('venue_categories', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        venue_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'venue_id'
        },
        main_category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'main_category_id'
        },
        category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'category_id'
        },


        /* 	createdAt: {
        		type: DataTypes.DATE,
        		allowNull: false,
        		defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        		field: 'created_at'
        	},
        	updatedAt: {
        		type: DataTypes.DATE,
        		allowNull: false,
        		defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        		field: 'updated_at'
        	} */
    }, {
        tableName: 'venue_categories'
    });
};