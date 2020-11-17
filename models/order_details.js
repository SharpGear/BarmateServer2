/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('orderDetails', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        venueId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'venue_id'
        },
        terminal_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'terminal_id'
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'user_id'
        },
        orderId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'order_id'
        },
        productId: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'product_id'
        },
        instructions: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'instructions'
		},
        quantity: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'quantity'
        },
        size: {
            type: DataTypes.STRING(64),
            allowNull: false,
            field: 'size'
        },
        product_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'product_name'
        },
        price: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'price'
        },
        conclude_status: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'conclude_status'
        },
        isCancelled: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: 0,
            field: 'is_cancelled'
        },
        category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'category_id'
        },
        sub_category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'sub_category_id'
        },
        timestamp: {
            type: DataTypes.INTEGER(11),
            defaultValue: Math.floor(Date.now() / 1000),
            allowNull: true,
            field: 'timestamp'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: '0000-00-00 00:00:00',
            field: 'updated_at'
        }
    }, {
        tableName: 'order_details'
    });
};