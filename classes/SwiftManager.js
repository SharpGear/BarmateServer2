const db = require('../models');
const VenueIntegration = db.venue_integration;
const Product = db.products;
const axios = require('axios');

module.exports = class KountaManager
{
	/**
	 *
	 * Models
	 *
	 */
	static async getVenueIntegration(id)
	{
		const venue_integration = await VenueIntegration.find({
			where: {
				venue_id: id
			}
		})
		return venue_integration;
	}

	/**
	 *
	 * Authentication
	 *
	 */
	static async getApiKey(venue_integration)
	{
		let {data} = await axios.post('https://webstores.swiftpos.com.au:4443/SwiftApi/api/Authorisation', {
			locationId: venue_integration.data.locationId,
			userId: venue_integration.data.userId,
			password: venue_integration.data.password
		})

		return data.ApiKey
	}

	/**
	 *
	 * API
	 *
	 */
	static async getProducts(apiKey)
	{
		let {data: products} = await axios.get('https://webstores.swiftpos.com.au:4443/SwiftApi/api/Product?includeImage=true', {
			headers: {
				ApiKey: apiKey
			}
		})
		return products
	}

	static async createOrder(apiKey, products)
	{
		let _products = []
		for (let product of products) {
			let p = await Product.find({
				where: {
					id: product.id
				}
			})
			_products.push({
				Id: Number(p.integration_id),
				Quantity: Number(product.quantity)
			})
		}
		try {
			await axios.post(`https://webstores.swiftpos.com.au:4443/SwiftApi/api/Order`, {
				"OrderDate": "2020-11-13T13:29:55.3843103+10:00",
				"ScheduledOrderDate": "2020-11-13T13:29:55.3843103+10:00",
				"Member": {
					"Id": "1",
					"Type": 0
				},
				"Items": _products
			}, {
				headers: {
					'ApiKey': apiKey,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				}
			})
		} catch (e) {
			return e
		}
		// return 'HELLO'
		// return 'order_sent'
	}
}