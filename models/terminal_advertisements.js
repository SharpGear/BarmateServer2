/* jshint indent: 1 */
let Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('terminal_advertisements', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		ad_id: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'ad_id'
		},
		venue_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'venue_id'
		},
    terminal_id: {
      type: DataTypes.INTEGER(11),
        allowNull: true,
        field: 'terminal_id'
      },
	 	createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'createdAt'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updatedAt'
		} 
	}, {
			tableName: 'terminal_advertisements'
		});
};
