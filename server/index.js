'use strict'

const express = require('express');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');
const socketIo = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIo(server);
const PORT = process.env.PORT || 5000;

// Mongoose setup
mongoose.connect(process.env.MLAB_URL);

let stocksSchema = new mongoose.Schema({
  id: String,
  stocks: Array
})
let StocksModel = mongoose.model('stocks', stocksSchema);

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

// All remaining requests return the React app, so it can handle routing.
app.get('*', function(request, response) {
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});


// Connect to Socket
io.on('connection', (socket) => {

	socket.on('addStock', (stock) => {
  		socket.broadcast.emit('addStock', stock);

  		StocksModel.findOne({id: '0'}, function(err, dbData) {
    		if (err) throw err;
    		let stocks = dbData.stocks;

    		stocks.push(stock);


    		StocksModel.update({id: '0'}, {
    			$set: {stocks: stocks}
    		}, function(err, data) {
    			if (err) throw err;
    		})
      	})
	})

	socket.on('removeStock', (stock) => {
    
		socket.broadcast.emit('removeStock', stock);

		StocksModel.findOne({id: '0'}, function(err, dbData) {
	    	if (err) throw err;

	    	let stocks = dbData.stocks;
	    	let indexToRemove = stocks.indexOf(stock);
	    	stocks.splice(indexToRemove, 1);
	    	StocksModel.update({id: '0'}, {
	    		$set: {stocks: stocks}
	    	}, function(err, data) {
	    		if (err) throw err;
	    	})
    	})
	})
})

// Listen to PORT
server.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
});
