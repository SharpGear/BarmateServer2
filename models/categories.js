/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('categories', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		venueId: {
			type: DataTypes.BIGINT,
			allowNull: true,
			field: 'venue_id'
		},
		main_category_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'main_category_id'
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'name'
		},
		for_all: {
			type: DataTypes.STRING(255),
			allowNull: true,
			defaultValue: 1,
			field: 'for_all'
		},
		image: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'image'
		},
		status: {
			type: DataTypes.INTEGER(1),
			allowNull: true,
			field: 'status'
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
			tableName: 'categories'
		});
};
