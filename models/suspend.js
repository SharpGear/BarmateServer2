/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('Suspend', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		venue_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'venue_id'
		},
		user_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'user_id'
		},	
		reason: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'reason'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'status'
		},	 
				
	
	}, {
			tableName: 'suspend'
		});
};
