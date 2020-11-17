/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('report', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		report_by: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'report_by'
		},
			
		reason: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'reason'
		},
            
        type: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'type'
		},
			
	
	}, {
			tableName: 'report'
		});
};
