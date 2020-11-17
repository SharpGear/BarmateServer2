/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('venue_reviews', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
    },
    review_to: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'review_to'
		},
		review_by: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'review_by'
		},			
		order_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'order_id'
		},			
		comment: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'comment'
		},
    rating: {
			type: DataTypes.FLOAT(11),
			allowNull: true,
			field: 'rating'
		},
			
	
	}, {
			tableName: 'venue_reviews'
		});
};
