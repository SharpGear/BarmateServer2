/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('subcategories', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		venueId: {
			type: DataTypes.INTEGER(1),
			allowNull: false,
			field: 'venue_id'
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'name'
		},
		categoryId: {
			type: DataTypes.BIGINT,
			allowNull: false,
			field: 'category_id'
		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'image'
		},
		status: {
			type: DataTypes.INTEGER(1),
			allowNull: true,
			field: 'status'
		},
		is_deleted: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'is_deleted'
		},
		main_category_id: {
			type: DataTypes.INTEGER(1),
			allowNull: true,
			field: 'main_category_id'
		},
		createdAt: {
			type: DataTypes.INTEGER(6),
			allowNull: false,
			field: 'createdAt'
		},
		updatedAt: {
			type: DataTypes.INTEGER(6),
			allowNull: false,
			field: 'updatedAt'
		}
	}, {
			tableName: 'subcategories'
		});
};
