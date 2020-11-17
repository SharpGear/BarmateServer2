/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('WebhookData', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		data: {
			type: DataTypes.TEXT(),
			allowNull: false,
			defaultValue: '',
			field: 'data'
		},

		createdAt: {
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
		}
	}, {
			tableName: 'webhook_data'
		});
};
