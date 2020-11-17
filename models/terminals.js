/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('terminals', {
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
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'name'
		},
		table_number: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'table_number'
		},
		main_category: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'main_category'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'status'
		},
		is_main: {
			type: DataTypes.BIGINT,
			allowNull: false,
			defaultValue :0,
			field: 'is_main'
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
			tableName: 'terminals'
		});
};
