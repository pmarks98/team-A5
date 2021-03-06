let {app,postgres} = require('../main'); 
const cleardb = `
TRUNCATE items, bids, users, shipments, payments; 
`;
const addFunds = `
    UPDATE users 
    SET balance = (balance + $2)
    WHERE id = $1
    RETURNING *`;
beforeEach(async () => {
	try{
		const client = await postgres.connect(); 
		await client.query(cleardb); 
		client.release(); 
		return null; 
	} catch(err) {
		return err; 
	}
});
const request = require('supertest');

describe('createItem', () => {
	it('should test that true === true',  () => {
    expect(true).toBe(true)
	})
	it('should create a item with proper parameters', async () => {
		//TODO incomplete, must first login with user id 
		const userData = {
			"first_name": "test",
			"last_name": "User",
			"email": "user@test.com",
			"password": "qwerty",
			"pic_url": "<profile_picture_url>",
			"address_1": "123 Address Lane",
			"address_2": "This should be optional",
			"city": "Los Angeles",
			"state": "CA",
			"zip": "90024",
			"phone": "1234567890"
		};
		const signUpResponse = await request(app).post('/api/users/signup')
			.send(userData)
			.set('Accept', 'applications/json')
			.expect(200); 
		let authid = signUpResponse.body.data.auth_token;
		const itemBody = {"item_name":"testitem", "pic_url":"<test_url>", "item_description" : "description", "tags" : "testing", "sale_price" : 50, "total_tickets":10 };
		const response = await request(app).post('/api/items/create')
			.send(itemBody)
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${authid}`)
			.expect(200);
		expect(response.body.data.item_name).toEqual("testitem"); 
	})
	it('should fail on item with no body', async() => {
		//TODO must first login 
		const userData = {
			"first_name": "test",
			"last_name": "User",
			"email": "user@test.com",
			"password": "qwerty",
			"pic_url": "<profile_picture_url>",
			"address_1": "123 Address Lane",
			"address_2": "This should be optional",
			"city": "Los Angeles",
			"state": "CA",
			"zip": "90024",
			"phone": "1234567890"
		};
		const signUpResponse = await request(app).post('/api/users/signup')
			.send(userData)
			.set('Accept', 'applications/json')
			.expect(200); 
		let authid = signUpResponse.body.data.auth_token;
		const response = await request(app).post('/api/items/create')
			.set('Authorization', `Bearer ${authid}`)
			.send(null)
			.expect(400);
		expect(response.body.message).toEqual("Malformed Request"); 
	})
	it('should fail on required missing data', async() => {
		//TODO must first login
		const userData = {
			"first_name": "test",
			"last_name": "User",
			"email": "user@test.com",
			"password": "qwerty",
			"pic_url": "<profile_picture_url>",
			"address_1": "123 Address Lane",
			"address_2": "This should be optional",
			"city": "Los Angeles",
			"state": "CA",
			"zip": "90024",
			"phone": "1234567890"
		};
		const signUpResponse = await request(app).post('/api/users/signup')
			.send(userData)
			.set('Accept', 'applications/json')
			.expect(200); 
		let authid = signUpResponse.body.data.auth_token;
		const itemBody = {"item_name":"testitem", "pic_url":"<test_url>", "item_description" : "description", "tags" : "testing",  "total_tickets":10 };
		await request(app).post('/api/items/create')
			.send(itemBody)
			.set('Authorization', `Bearer ${authid}`)
			.expect(400);  
	})
	it('should pass on optional missing data', async() => {
		//TODO must first login
		const userData = {
			"first_name": "test",
			"last_name": "User",
			"email": "user@test.com",
			"password": "qwerty",
			"pic_url": "<profile_picture_url>",
			"address_1": "123 Address Lane",
			"address_2": "This should be optional",
			"city": "Los Angeles",
			"state": "CA",
			"zip": "90024",
			"phone": "1234567890"
		};
		const signUpResponse = await request(app).post('/api/users/signup')
			.send(userData)
			.set('Accept', 'applications/json')
			.expect(200); 
		let authid = signUpResponse.body.data.auth_token;
		const itemBody = {"item_name":"testitem", "pic_url":"<test_url>", "item_description" : "description", "sale_price" : 50, "total_tickets":10 };
		await request(app).post('/api/items/create')
			.send(itemBody)
			.set('Authorization', `Bearer ${authid}`)
			.expect(200);  
	})
})
describe('Create Bid', () => {
	it('should properly create a bid given the correct parameters', async () => {
		//TODO change balance amount
		const userData = {
			"first_name": "test",
			"last_name": "User",
			"email": "user@test.com",
			"password": "qwerty",
			"pic_url": "<profile_picture_url>",
			"address_1": "123 Address Lane",
			"address_2": "This should be optional",
			"city": "Los Angeles",
			"state": "CA",
			"zip": "90024",
			"phone": "1234567890"
		};
		const userData2 = {
			"first_name": "test1",
			"last_name": "User",
			"email": "user2@test.com",
			"password": "qwerty",
			"pic_url": "<profile_picture_url>",
			"address_1": "123 Address Lane",
			"address_2": "This should be optional",
			"city": "Los Angeles",
			"state": "CA",
			"zip": "90024",
			"phone": "1234567890"
		};
		const signUpResponse = await request(app).post('/api/users/signup')
			.send(userData)
			.set('Accept', 'applications/json')
			.expect(200); 
		let authid = signUpResponse.body.data.auth_token;
		const itemBody = {"item_name":"testitem", "pic_url":"<test_url>", "item_description" : "description", "tags" : "testing", "sale_price" : 50, "total_tickets":10 };
		const create = await request(app).post('/api/items/create')
			.send(itemBody)
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${authid}`)
			.expect(200);
		const item_id = create.body.data.item_id; 
		const signUpResponse2 = await request(app).post('/api/users/signup')
			.send(userData2)
			.set('Accept', 'applications/json')
			.expect(200); 
		let authid2 = signUpResponse2.body.data.auth_token;
		let userid2 = signUpResponse2.body.data.id;
		const desiredBalance = [userid2,100];
		try {
			const client = await postgres.connect(); 
			const res = await client.query(addFunds, desiredBalance);
			client.release(); 
		} catch(err) {
			throw new Error("Did not add Balance")
		}
		const bidBody = {"ticket_count" : 1, "total_cost" : 5, "random_seed" :210487};
		const response = await request(app).post(`/api/items/bid/${item_id}`)
			.send(bidBody)
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${authid2}`)
			.expect(200); 
		expect(response.body.data.bid.total_cost).toEqual(5); 
	})
	it('should refuse to create a bid for a user not logged in', async () => {
		const userData = {
			"first_name": "test",
			"last_name": "User",
			"email": "user@test.com",
			"password": "qwerty",
			"pic_url": "<profile_picture_url>",
			"address_1": "123 Address Lane",
			"address_2": "This should be optional",
			"city": "Los Angeles",
			"state": "CA",
			"zip": "90024",
			"phone": "1234567890"
		};
		const signUpResponse = await request(app).post('/api/users/signup')
			.send(userData)
			.set('Accept', 'applications/json')
			.expect(200); 
		let authid = signUpResponse.body.data.auth_token;
		const itemBody = {"item_name":"testitem", "pic_url":"<test_url>", "item_description" : "description", "tags" : "testing", "sale_price" : 50, "total_tickets":10 };
		const create = await request(app).post('/api/items/create')
			.send(itemBody)
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${authid}`)
			.expect(200);
		const item_id = create.body.data.item_id; 
		const response = await request(app).post(`/api/items/bid/${item_id}`)
			.send({"ticket_count":1, "total_cost":5})
			.set('Accept', 'application/json')
			.expect(400); 
	})
	it('should refuse to create a bid for a user with insufficient funds', async () => {
		//TODO: change balance amount
		const userData = {
			"first_name": "test",
			"last_name": "User",
			"email": "user@test.com",
			"password": "qwerty",
			"pic_url": "<profile_picture_url>",
			"address_1": "123 Address Lane",
			"address_2": "This should be optional",
			"city": "Los Angeles",
			"state": "CA",
			"zip": "90024",
			"phone": "1234567890"
		};
		const userData2 = {
			"first_name": "test1",
			"last_name": "User",
			"email": "user2@test.com",
			"password": "qwerty",
			"pic_url": "<profile_picture_url>",
			"address_1": "123 Address Lane",
			"address_2": "This should be optional",
			"city": "Los Angeles",
			"state": "CA",
			"zip": "90024",
			"phone": "1234567890"
		};
		const signUpResponse = await request(app).post('/api/users/signup')
			.send(userData)
			.set('Accept', 'applications/json')
			.expect(200); 
		//const setFunds = await request(app).post
		let authid = signUpResponse.body.data.auth_token;
		const itemBody = {"item_name":"testitem", "pic_url":"<test_url>", "item_description" : "description", "tags" : "testing", "sale_price" : 50, "total_tickets":10 };
		const create = await request(app).post('/api/items/create')
			.send(itemBody)
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${authid}`)
			.expect(200);
		const item_id = await create.body.data.item_id; 
		const signUpResponse2 = await request(app).post('/api/users/signup')
			.send(userData2)
			.set('Accept', 'applications/json')
			.expect(200); 
		let authid2 = signUpResponse2.body.data.auth_token;
		const response = await request(app).post(`/api/items/bid/${item_id}`)
			.send({"ticket_count":1, "total_cost":5, "random_seed":5 })
			.set('Accept', 'application/json')
			.set('Authorization', `Bearer ${authid2}`)
			.expect(400); 
		expect(response.body.message).toEqual("Insufficient Funds"); 

	})
})

