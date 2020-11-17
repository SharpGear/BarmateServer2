const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

(async () => {

	const URL = 'https://webstores.swiftpos.com.au:4443/SwiftApi/api/'

	let {data} = await axios.post(URL + 'Authorisation', {
		"UserId": 0,
		"Password": 0,
		"LocationId": 1,
	})
	let apiKey = data.ApiKey

	console.log(apiKey);

	/**
	 * Products
	 */
	let {data: products} = await axios.get(URL + 'Product', {
		params: {
			includeImage: true,
		},
		headers: {
			'Accept': 'application/json',
			'ApiKey': apiKey,
		},
	})
	// console.log(products);

	/**
	 * Member
	 */
	// try {
	// 	let {data: member} = await axios.post(URL + 'Member', {
	// 		Id: 567567567,
	// 		Type: 0,
	// 		FirstName: 'TheBarMate',
	// 		Surname: 'TheBarMate',
	// 		DateOfBirth: (new Date(1980, 12, 12)).toISOString(),
	// 		EmailAddress: 'support@thebarmate.com2',
	// 		Classifications: [
	// 			{
	// 				"Id": 1,
	// 				"Type": 1,
	// 				"RenewalDate": (new Date(2030, 12, 12)).toISOString()
	// 			}
	// 		]
	// 	}, {
	// 		headers: {
	// 			'Accept': 'application/json',
	// 			'Content-Type': 'application/json',
	// 			'ApiKey': apiKey,
	// 		}
	// 	})
	// 	console.log(member);
	// } catch (e) {
	// 	console.log(e.response.data);
	// }

	/**
	 * Order
	 */
	try {
		let {data: order} = await axios.post(URL + 'Order', {
			Id: 1,
			Type: 3, // EatIn
			OrderDate: (new Date()).toISOString(),
			ScheduledOrderDate: (new Date()).toISOString(),
			Member: {
				"Id": 567567567,
				"Type": 0,
			},
			Items: [
				{
					Id: products[0].Id,
					Quantity: products[0].Quantity,
					Price: products[0].Price
				}
			]
		}, {
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'ApiKey': apiKey,
			}
		})
		console.log(order);
	} catch (e) {
		console.log(e.response.data);
	}

})()