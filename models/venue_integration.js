/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('venue_integration', {
		venue_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: false,
			field: 'venue_id'
		},
		site: {
			type: DataTypes.STRING(255),
			allowNull: false,
			primaryKey: false,
			autoIncrement: false,
			field: 'site'
		},
		data: {
			type: DataTypes.JSON(),
			allowNull: false,
			field: 'data'
		},
		completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 0,
			field: 'completed'
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
		},
	}, {
		tableName: 'venue_integration'
	});
};