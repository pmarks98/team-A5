const express = require('express');
const _ = require('lodash');
const buyerView = ['item_id', 'item_name', 'seller_id', 'pic_url', 'item_description', 'tags', 'sale_price', 'ticket_price', 'total_tickets', 'tickets_sold', 'status', 'deadline']
const bidderView = ['item_id', 'item_name', 'seller_id', 'pic_url', 'item_description', 'tags', 'sale_price', 'ticket_price', 'total_tickets', 'tickets_sold', 'status', 'deadline', 'total_cost', 'tickets_bought']

const ItemController = (itemModel, userModel, authService) => {
  const router = express.Router();

  // The API path to create a new item. Creates an item object and returns that object
  router.post('/create', async (req, res) => {
    if (!req.body) return res.status(400).json({
      "message": "Malformed Request",
    });
    body = req.body
    // Get user inputs
    const item_name = body['item_name']
    const pic_url = body['pic_url']
    const item_description = body['item_description']
    const tags = body['tags']
    const sale_price = body['sale_price']
    const total_tickets = body['total_tickets']
	
	if (item_name == null || item_name == "" ||
		sale_price == null || sale_price == "" ||
		total_tickets == null || total_tickets == ""){
		return res.status(400).json({"message":"Malformed Request"});
	}
    
    // Set other vars
    var dt = new Date();
    dt.setDate(dt.getDate() + 7); // current date + 7 days (week deadline)
    const deadline = dt.toUTCString();
    const status = "IP"
    const ticket_price = sale_price / total_tickets
    // Get the user_id of the user sending the request for the seller_id
    const [user_info, err1] = await authService.getLoggedInUserInfo(req.headers);   
    if (err1) {
      return res.status(400).json({
        data: null,
        message: err1
      });
    }

    const seller_id = user_info['id']

    const [item, err2] = await itemModel.createItem(
      item_name,
      seller_id,
      pic_url,
      item_description,
      tags,
      sale_price,
      ticket_price,
      total_tickets,
      deadline,
      status,
    );

    if (err2) {
      return res.status(400).json({
        data: null,
        message: err2.message,
      });
    }
    return res.status(200).json({
      data: item,
      message: '',
    });
  });

  // Returns a feed of Items that are being sold
  router.get('/feed', async (req, res) => {
    const [items, err] = await itemModel.getItemFeed();

    if (err) {
      return res.status(400).json({
        data: null,
        message: err.message
      });
    }

    // For each item, only get the buyer's view of it
    let buyer_view_items = []
    for (let i = 0; i<items.length; i++) {
      buyer_view_items.push(_.pick(items[i], buyerView))
    }

    return res.status(200).json({
        data: buyer_view_items,
        message: ""
      });
  })

  // Creates a bid for the specified item
  router.post('/bid/:item_id', async (req, res) => {
    const params = req.params;
    const item_id = parseInt(params.item_id, 10);
  
    // Get the user_id of the user sending the request, to know who is making the bid
    const [user_info, err1] = await authService.getLoggedInUserInfo(req.headers);

    if (err1) {
      return res.status(400).json({
        data: null,
        message: err1
      });
    }

    const user_id = user_info['id']
    const user_current_funds = user_info['balance']

    body = req.body
    // Get user inputs
    const ticket_count = body['ticket_count']
    const total_cost = body['total_cost'] 
    const random_seed = body['random_seed']

    // Check to make sure user has sufficient funds
    if (user_current_funds < total_cost) {
      return res.status(400).json({
        data: null,
        message: "Insufficient Funds"
      });
    }

    // The createBid function is atomic, so we can assume this function
    // handles all error checks

    // TODO do we want this to return the new item info?
    const [bid, err2] = await itemModel.createBid(
      user_id, 
      item_id, 
      ticket_count, 
      total_cost,
      random_seed,
    );

    if (err2) {
      return res.status(400).json({
        data: null,
        message: err2,
      });
    }

    // If there is no error, the transaction went through, so debit user funds

    const [new_balance, err3] = await userModel.debitUserFunds(user_id, total_cost);

    if (err3) {
      return res.status(400).json({
        data: null,
        message: err3.message,
      });
    }

    return res.status(200).json({
      data:
        {
          bid: bid,
          new_user_balance: new_balance['balance'],
        },
      message: '',
    });
  });

  // Gets the list of all items that the user is selling and all items that the user has bid on 
  // Uses the authentication token to get the user information
  router.get('/me', async (req, res) => {
  
    // Get the user_id of the user sending the request
    const [user_info, err] = await authService.getLoggedInUserInfo(req.headers);

    if (err) {
      return res.status(400).json({
        data: null,
        message: err
      });
    }

    // Get all items where the logged in user is the seller
    const [items_selling, err1] = await itemModel.getItemsForSeller(user_info['id'])

    if (err1) {
      return res.status(400).json({
        data: null,
        message: err1
      });
    }

    // Get all of the items that the user has bid on
    const [bid_info, err2] = await itemModel.getBidsForUser(user_info['id'])
    
    if (err2) {
      return res.status(400).json({
        data: null,
        message: err2
      });
    }

    // Users who bid on items should see limited information about the items
    // Make sure each item that is returned only has the specfic information included
    var items_bidding = []
    var arrayLength = bid_info.length;
    for (var i = 0; i < arrayLength; i++) {
      var bid = _.pick(bid_info[i], bidderView)
      items_bidding.push(bid)
      
    }

    // Return one data object with all of the items the user is selling an the items the user is bidding on
    const data = {"items_selling": items_selling, "items_bidding": items_bidding}

    return res.status(200).json({
      data: data,
      message: ""
    });
  });


  // Gets the item info for the item with item_id specified
  // If the logged in user is not the seller, we show an 
  // abbreviated item page of name, picture, description
  // tags, price, and ticket price
  router.get('/:item_id', async (req, res) => {
    const params = req.params;
    const item_id = parseInt(params.item_id, 10);
  
    // Get the user_id of the user sending the request, to check if the ids match
    const [user_info, err1] = await authService.getLoggedInUserInfo(req.headers);
    

    if (err1) {
      return res.status(400).json({
        data: null,
        message: err1
      });
    }

    const [item, err2] = await itemModel.getItemInfo(item_id)
    if (err2) {
      return res.status(400).json({
        data: null,
        message: err2
      });
    }
    // if the logged in user is the one selling the item, show full information
    if (user_info['id'] == item['seller_id']) {
      return res.status(200).json({
        data: item,
        message: ""
      });
    }

    // otherwise, return only item name, picture, description, tags, item price
    // ticket price, number of tickets, status, and deadline 
    return res.status(200).json({
      data: _.pick(item, buyerView),
      message: ""
    });
  });

  return router;

}
  
module.exports = {
  ItemController,
};

