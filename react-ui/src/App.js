import React from 'react';
import io from 'socket.io-client';
import './App.css';
import Chart from './components/Chart';
import TimeForm from './components/TimeForm';
import Controlls from './components/Controlls';
import Loader from './components/Loader';

import $ from 'jquery';
import moment from 'moment';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      timePereod: 60,
      data: {},
      loading: true,
      message: ''
    }
  }

  componentDidMount() {
    this.socket = io('/');

    this.socket.on('addStock', stock => {
      this.addStock(stock, false);
    })

    this.socket.on('removeStock', stock => {
      this.removeStock(stock, false);
    })

    const apiKey = 'ekNbrcg1UpsoXIr-Q7-ACgeF_uuS24YK';
    const dbName = 'stock-market-chart';
    const collection = 'stocks';
    $.ajax({
      url: "https://api.mlab.com/api/1/databases/" + dbName + "/collections/" + collection + "?apiKey=" + apiKey,
      success: (data) => {
        if (data[0]['stocks']) {
          this.getData(
            data[0]['stocks'],
            (fullHistoricalData) => {
            this.setState({
              data: fullHistoricalData,
              loading: false
            });
          });
        } else {
          this.setState({ loading: false });
        }
      }
    })
    
  }

  removeStock(stock, fromThisUser) {

    if (fromThisUser) {
      this.socket.emit('removeStock', stock);
    }
    let stocks = Object.keys(this.state.data);
    stocks.splice(stocks.indexOf(stock), 1);
    this.setState({ loading: true });
    this.getData(stocks, (fullHistoricalData) => {
      this.setState({data: fullHistoricalData, loading: false });
    })
  }

  addStock(stock, fromThisUser) {

    stock = stock.toUpperCase();
    let stocks = Object.keys(this.state.data);

    if (stocks.indexOf(stock) !== -1) {
      this.setState({ message: 'Stock is already on the list.'});
    } else {
        stocks.push(stock);
      this.setState({ loading: true, message: '' });
      this.getData(stocks, (fullHistoricalData) => {
        if (!fullHistoricalData) {
          this.setState({ message: 'The stock you searched for wasn\'t found.', loading: false });
        } else {
          this.setState({data: fullHistoricalData, loading: false });
          if (fromThisUser) {
            this.socket.emit('addStock', stock);
          }
        }
      })
    }
  }

  getData(stockList, callback) {
    let promises = [];

    for (let i = 0; i < stockList.length; i++) {

      let p = new Promise((resolve, reject) => {

        let dataFromSessionStorage = JSON.parse(sessionStorage.getItem(stockList[i]));
          if (dataFromSessionStorage) {
            let stockData = {};
            stockData[stockList[i]] = dataFromSessionStorage;
            resolve(stockData);

          } else {

          this.getFromApi(stockList[i], (data) => {
            if (data['Weekly Time Series']) {
              let parsedData = this.parseDataToStore(data['Weekly Time Series']);

                  sessionStorage.setItem(stockList[i], JSON.stringify(parsedData));
                  let stockData = {};
                  stockData[stockList[i]] = parsedData;
                  resolve(stockData);
            } else {
                  reject(data);
                }
                });
        }
      })
      promises.push(p);
      }

      Promise.all(promises).then(promiseArr => {
        let fullHistoricalData = {};
        for (let i = 0; i < promiseArr.length; i++) {
          fullHistoricalData[Object.keys(promiseArr[i])[0]] = Object.values(promiseArr[i])[0];
        }
        callback(fullHistoricalData);
      }, stockCode => {
        console.log('error');
        callback(false);
      })
  }

  getFromApi(stock, callback) {

    let baseUrl = 'https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=';
        let keyUrl = '&apikey=26BIR4PKMC1G6V0A';
        let url = baseUrl + stock + keyUrl;
      $.getJSON(url, function(data) {
        callback(data);
      });
  }
  
  parseDataToStore(fullData) {

    let dateList = [];
    let priceList = [];
      let currentDate = moment();
      let startDate = moment().year(currentDate.year() - 5);

      while (startDate < currentDate) {
        dateList.push(startDate.format('D MMM YYYY'));

        if (startDate.format('YYYY-MM-DD') in fullData && fullData[startDate.format('YYYY-MM-DD')]['4. close'] > 0) {
          priceList.push(fullData[startDate.format('YYYY-MM-DD')]['4. close']);
        } else {
          priceList.push(null);
        }
        startDate = startDate.add(1, 'days');
      }
      return {dates: dateList, prices: priceList};
  }

  parseDataToChart() {

    let inputData = this.state.data;
    let parsedData = {};

    let currentDate = moment();
    let startDate = moment().month(currentDate.month() - this.state.timePereod);

    for (let stock in inputData) {
      let newPricesList = [];

      let startingIndex = inputData[stock]['dates'].indexOf(startDate.format('D MMM YYYY'));

      // Find Starting Price
      let startingPrice = -1;
      let j = 0;
      while (startingPrice === -1) {
        if (inputData[stock]['prices'][startingIndex + j]) {
          startingPrice = inputData[stock]['prices'][startingIndex + j];
        }
        j += 1;
      }

      // change price data to percentages and crop to timePereod
      for (j = startingIndex; j < inputData[stock]['prices'].length; j++) {
        if (inputData[stock]['prices'][j]) {
          newPricesList.push((inputData[stock]['prices'][j] / startingPrice - 1 ) * 100);
        } else {
          newPricesList.push(null);
        }
      }
      let stockData = {};
      stockData['prices'] = newPricesList;
      stockData['dates'] = inputData[stock]['dates'].slice(startingIndex);

      parsedData[stock] = stockData;
    }

    return parsedData;
  }

  randomColor() {
    let r1 = Math.round(Math.random() * 200);
    let r2 = Math.round(Math.random() * 200);
    let r3 = Math.round(Math.random() * 200);
    let colorStr = 'rgb(' + r1 + ',' + r2 + ',' + r3 + ')';
    return colorStr;
  }

  changeTimePereod(timePereod) {
    this.setState({ timePereod: parseInt(timePereod, 10) });
  }

    render() {

      let dateList;
      let datasets = [];
      if (Object.keys(this.state.data).length) {
        
        let parsedData = this.parseDataToChart();


        for (let stock in parsedData) {
              let prices = parsedData[stock]['prices'];
              dateList = parsedData[stock]['dates'];

              let data = {
                  label: stock,
                  backgroundColor: 'rgba(0,0,0,0)',
                  borderColor: this.randomColor(),
                  data: prices,
                  pointRadius: 1,
                  pointHitRadius: 5,
                  borderWidth: 1,
                  spanGaps: true
              }

              datasets.push(data);
          }
      } else {
        dateList = [];
      }

      let chartJsData = { labels: dateList, datasets: datasets };

      return (
          <div className="App">
            <h1 id='heading'>Stock Charting App</h1>
            <TimeForm
            timePereod={this.state.timePereod}
            changeTimePereod={this.changeTimePereod.bind(this)} />
            {this.state.loading && <Loader />}
            <Chart data={chartJsData} />
            <Controlls
            data={this.state.data}
            removeStock={this.removeStock.bind(this)}
            addStock={this.addStock.bind(this)}
            message={this.state.message} />
            <p id="footnote">Coded by Elliot Zoerner. <a target="_blank"
            href="https://github.com/elliotjz/stock-market-chart-react">Source Code</a></p>
          </div>
      );
    }
}

export default App;

