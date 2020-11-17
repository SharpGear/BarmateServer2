/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('mainCategory', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		title: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'title'
		},
		createdAt: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'created_at'
		},
		updatedAt: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'updated_at'
		},
		isDeleted: {
			type: DataTypes.INTEGER(1),
			allowNull: false,
			field: 'is_deleted'
		}
	}, {
		tableName: 'main_category'
	});
};
