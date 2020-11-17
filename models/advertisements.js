/* jshint indent: 1 */
let Sequelize = require('sequelize');

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('advertisements', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		title: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'title'
		},
		link: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'link'
		},
		gender: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'gender'
		},
		min_age: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'min_age'
		},
		max_age: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'max_age'
		},
		venue_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			field: 'venue_id'
		},
    media: {
      type: DataTypes.STRING(255),
        allowNull: true,
        field: 'media'
      },
		description: {
			type: DataTypes.STRING(255),
			allowNull: true,
			field: 'description'
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
			tableName: 'advertisements'
		});
};
