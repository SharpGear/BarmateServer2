/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('contents', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		title: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'title'
		},
		description: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'description'
        },
        slug: {
			type: DataTypes.STRING(100),
			allowNull: false,
			field: 'slug'
		},
	
	}, {
			tableName: 'contents'
		});
};
