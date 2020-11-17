/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('favourites', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'user_id'
		},
		venue_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'venue_id'
		},
	
	}, {
			tableName: 'favourites'
		});
};
