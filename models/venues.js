/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('venues', {
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'name'
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'email'
        },
        terminal_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            field: 'terminal_id'
        },
        avg_rating: {
            type: DataTypes.FLOAT(11),
            allowNull: true,
            field: 'avg_rating'
        },
        gender: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            field: 'gender'
        },
        image: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'image'
        },
        phone: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'phone'
        },
        fax: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'fax'
        },
        abn: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'abn'
        },
        is_verified: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: '0',
            field: 'is_verified'
        },
        card_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: '0',
            field: 'card_id'
        },
        card_verified: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: '0',
            field: 'card_verified'
        },
        card_type: {
            type: DataTypes.TINYINT(1),
            allowNull: true,
            defaultValue: '0',
            field: 'card_type'
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'password'
        },
        device_type: {
            type: DataTypes.TINYINT(1),
            allowNull: true,
            field: 'device_type'
        },
        device_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'device_token'
        },
        latitude: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'latitude'
        },
        longitude: {
            type: DataTypes.STRING(50),
            allowNull: true,
            field: 'longitude'
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'address'
        },
        bank_account_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'bank_account_name'
        },
        bank_location: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'bank_location'
        },
        account_number: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'account_number'
        },
        bsb: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'bsb'
        },
        paypal_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'paypal_id'
        },
        paypal_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'paypal_id'
        },
        dob: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'dob'
        },
        user_type: {
            type: DataTypes.TINYINT(1),
            allowNull: true,
            field: 'user_type'
        },
        bank_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'bank_name'
        },
        account_type: {
            type: DataTypes.TINYINT(1),
            allowNull: true,
            field: 'account_type'
        },

        status: {
            type: DataTypes.TINYINT(1),
            allowNull: true,
            defaultValue: '0',
            field: 'status'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updated_at'
        },
        open: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: '0',
            field: 'open'
        },
        forgot_password: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'forgot_password'
        },
        post_code: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'post_code'
        },
        account_id: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: '0',
            field: 'account_id'
        },
        has_account_id: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: '0',
            field: 'has_account_id'
        },
    }, {
        tableName: 'venues'
    });
};