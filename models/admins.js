/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('admins', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		email: {
			type: DataTypes.STRING(50),
			allowNull: false,
			field: 'email'
		},
		password: {
			type: DataTypes.STRING(50),
			allowNull: false,
			field: 'password'
		},
		tbm_tax: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'tbm_tax'
		},
		createdAt: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'createdAt'
		},
		updatedAt: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'updatedAt'
		}
	}, {
			tableName: 'admins'
		});
};
