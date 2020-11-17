/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('venue_search_keywords', {
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
        
		keyword: {
			type: DataTypes.STRING(100),
			allowNull: true,
			field: 'keyword'
		},
		venue_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'venue_id'
		},
		 
		
			
		
	}, {
			tableName: 'venue_search_keywords'
		});
};
