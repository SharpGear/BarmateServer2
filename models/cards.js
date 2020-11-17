/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Cards', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		venue_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'venue_id'
		},
		card_type: {
			type: DataTypes.STRING(50),
			allowNull: false,
			field: 'card_type'
		},
		card_number: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'card_number'
		},
		card_expiry: {
			type: DataTypes.STRING(50),
			allowNull: false,
			field: 'card_expiry'
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
			tableName: 'cards'
		});
};
