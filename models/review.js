/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('review', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		review_by: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'review_by'
		},
			
		comment: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'comment'
		},
            
        type: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'type'
		},
			
	
	}, {
			tableName: 'review'
		});
};
