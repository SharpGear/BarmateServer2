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
	static async createVenueIntegration(venueId, data)
	{
		await VenueIntegration.findOrCreate({
			where: {
				venue_id: venueId
			},
			defaults: {
				site: 'kounta',
				data: data
			}
		})
	}

	static async getVenueIntegration(id)
	{
		const venue_integration = await VenueIntegration.find({
			where: {
				venue_id: id
			}
		})
		return venue_integration;
	}

	static async saveProducts(venueIntegration, products)
	{
		for(let product of products) {
			await Product.create({
				name: product.name,
				integration_id: product.id,
				integration_site: 'kounta',
				price: product.unit_price,
				image: product.image,
				venue_id: venueIntegration.venue_id,
				main_category_id: 3 // Unknown
			})
		}
	}

	static async deleteProducts(venueIntegration)
	{
		await Product.destroy({
			where: {
				venue_id: venueIntegration.venue_id,
				integration_site: 'kounta'
			}
		})
	}

	static async disconnect(venueIntegration)
	{
		await KountaManager.deleteProducts(venueIntegration)
		await venueIntegration.destroy()
	}

	/**
	 *
	 * Authentication
	 *
	 */
	async getAccessToken()
	{
		return 'getAccessToken'
	}

	static async refreshAccessToken(venueIntegration)
	{
		let {data: token} = await axios.post('https://api.kounta.com/v1/token', {
			refresh_token: venueIntegration.data.refresh_token,
			client_id: venueIntegration.data.client_id,
			client_secret: venueIntegration.data.client_secret,
			grant_type: 'refresh_token'
		}, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		})
		await venueIntegration.update({
			data: {
				...venueIntegration.data,
				access_token: token.access_token,
				expires_in: token.expires_in,
				token_type: token.token_type
			},
			completed: true
		})
		return venueIntegration
	}

	/**
	 *
	 * API
	 *
	 */
	static async getCompany(venueIntegration)
	{
		let {data: company} = await axios.get('https://api.kounta.com/v1/companies/me', {
			headers: {
				'Authorization': 'Bearer ' + venueIntegration.data.access_token,
			}
		})
		return company
	}

	static async getSites(venueIntegration, company)
	{
		let {data: sites} = await axios.get(`https://api.kounta.com/v1/companies/${company.id}/status`, {
			headers: {
				'Authorization': 'Bearer ' + venueIntegration.data.access_token,
			}
		})
		return sites
	}

	static async getProducts(venueIntegration, company, site)
	{
		let fullProducts = []
		let {data: products} = await axios.get(`https://api.kounta.com/v1/companies/${company.id}/sites/${site.site_id}/products`, {
			headers: {
				'Authorization': 'Bearer ' + venueIntegration.data.access_token,
			}
		})
		for(let product of products) {
			let {data: fullProduct} = await axios.get(`https://api.kounta.com/v1/companies/${company.id}/sites/${site.site_id}/products/${product.id}`, {
			    headers: {
			        'Authorization': 'Bearer ' + venueIntegration.data.access_token,
			    }
			})
			fullProducts.push(fullProduct)
		}
		return fullProducts
	}

	static async createOrder(venueIntegration, company, site, products)
	{
		let _products = []
		for (let product of products) {
			let p = await Product.find({
				where: {
					id: product.id
				}
			})
			_products.push({
				product_id: Number(p.integration_id),
				quantity: Number(product.quantity)
			})
		}
		await axios.post(`https://api.kounta.com/v1/companies/${company.id}/orders`, {
			"site_id": site.site_id,
			"lines": _products,
			// "lines": [
			// 	{
			// 		"product_id": 11705307,
			// 		"quantity": 1
			// 	}
			// ]
		}, {
			headers: {
				'Authorization': 'Bearer ' + venueIntegration.data.access_token,
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			}
		})
		// return 'order_sent'
	}
}