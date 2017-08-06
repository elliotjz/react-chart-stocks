import React from 'react';
import { Line } from 'react-chartjs-2';

class Chart extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			options: {
	            scales: {
	                yAxes: [{
	                    scaleLabel: {
	                        display: true,
	                        labelString: 'Percentage Change',
	                        fontSize: 20
	                    },
	                    ticks: {
	                    callback: function(value, index, values) {
	                        return value + '%';
	                    }
	                }
	                }],
	                xAxes: [{
	                    type: 'time',
	                    unit: 'day',
	                    unitStepSize: 1,
	                    time: {
	                        displayFormats: {
	                            'day': 'MMM DD'
	                        }
	                    },
	                    ticks: {
	                    	minRotation: 45,
	                    	color: '#472942'
	                    }
	                }]
	            },
	            legend: {
	                onClick: (e) => e.stopPropagation()
	            },
	            tooltips: {
	        		callbacks: {
	            		label: function(tooltipItem, data) {
	                		return tooltipItem.yLabel.toFixed(2) + '%';
	            		},
	            		title: function(toolTipItem, data) {
	            			return data.datasets[toolTipItem[0]['datasetIndex']].label;
	            		}
	        		}
	    		}
	        }
	    }
	}

	render() {
		
		return (
			<div id='chart-container'>
				<Line
				data={this.props.data}
				options={this.state.options}
				width={600}
				height={250}
				/>
			</div>
		);
	}
}

export default Chart;
