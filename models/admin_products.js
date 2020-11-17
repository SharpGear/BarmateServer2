/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('admin_products', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'name'
		},
		brand_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'brand_id'
		},
		categoryId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'category_id'
		}, 
		main_category_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'main_category_id'
		},
		subcategoryId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'subcategory_id'
		},
		price: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'price'
		},		
		image: {
			type: DataTypes.TEXT,
			allowNull: false,
			field: 'image'
		},
		quantity: {
			type: DataTypes.STRING(200),
			allowNull: true,
			field: 'quantity'
		},
		unit: {
			type: DataTypes.STRING(50),
			allowNull: true,
			field: 'unit'
		},
		description: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'description'
		},
		cat_data: {
			type: DataTypes.TEXT,
			allowNull: true,
			field: 'cat_data'
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
			tableName: 'admin_products'
		});
};
