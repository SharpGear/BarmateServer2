/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('products', {
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		// product_id: {
		// 	type: DataTypes.BIGINT(20),
		// 	allowNull: true,
		// 	field: 'product_id'
		// },
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
		integration_id: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'integration_id'
		},
		integration_site: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'integration_site'
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
		venue_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'venue_id'
		},
		terminal_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'terminal_id'
		},
		subcategoryId: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'subcategory_id'
		},
		admin_product_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'admin_product_id'
		},
		price: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'price'
		},		
		image: {
			type: DataTypes.TEXT,
			allowNull: true,
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
		description: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'description'
		},
		is_deleted: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'is_deleted'
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
			tableName: 'products'
		});
};
