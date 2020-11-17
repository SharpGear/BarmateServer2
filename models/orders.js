/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('orders', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        venue_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'venue_id'
        },
        terminal_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            field: 'terminal_id'
        },
        user_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'user_id'
        },
        main_category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            field: 'main_category_id'
        },
        sub_category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'sub_category_id'
        },
        total: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'total'
        },
        round: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'round'
        },
        tbm_service: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'tbm_service'
        },
        table_number: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'table_number'
        },
        status: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            field: 'status'
        },
        cancellation_reason: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'cancellation_reason'
        },
        cancelled_by: {
			type: DataTypes.INTEGER(1),
			allowNull: true,
			field: 'cancelled_by'
		},
        is_refunded: {
			type: DataTypes.INTEGER(1),
			allowNull: true,
			field: 'is_refunded'
		},
        userBadgeSeen: {
			type: DataTypes.INTEGER(1),
			allowNull: true,
			field: 'userBadgeSeen'
		},
        venueBadgeSeen: {
			type: DataTypes.INTEGER(1),
			allowNull: true,
			field: 'venueBadgeSeen'
		},
        conclude_status: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            field: 'conclude_status'
        },
        order_group: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'order_group'
        },
        receipt_no: {
            type: DataTypes.STRING(1000),
            allowNull: true,
            field: 'receipt_no'
        },
        order_no: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'order_no'
        },

        createdAt: {
            type: DataTypes.INTEGER(11),
            defaultValue: Math.floor(Date.now() / 1000),
            allowNull: false,
            field: 'createdAt'
        },
        updatedAt: {
            type: DataTypes.INTEGER(11),
            defaultValue: Math.floor(Date.now() / 1000),

            allowNull: false,
            field: 'updatedAt'
        }
    }, {
        tableName: 'orders'
    });
};