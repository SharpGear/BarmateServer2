/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('transactions', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'user_id'
		},
		order_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'order_id'
		},
		venue_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'venue_id'
        },
        transaction_id: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'transaction_id'
		},
		pay_id: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'pay_id'
		},
		charge_id: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '0',
			field: 'charge_id'
		},
		payment_type: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'payment_type'
        },
        amount: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'amount'
		},
		payout: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'payout'
		},
		stripe_transfer_id: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '0',
			field: 'stripe_transfer_id'
		},
		stripe_refund_id: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: '0',
			field: 'stripe_refund_id'
		},
		status: {
			type: DataTypes.STRING(50),
			allowNull: true,
			field: 'status'
		},
		
	}, {
			tableName: 'transactions'
		});
};
