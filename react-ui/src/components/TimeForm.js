import React from 'react';
import TimeButton from './TimeButton';

class TimeForm extends React.Component {

	clickHandler(timePereod) {
		this.props.changeTimePereod(timePereod);
	}
	render() {
		return (
			<div id='time-form'>
				<form id='time-pereod-form'>
					<TimeButton
					val='5Y'
					timePereod={60}
					selected={this.props.timePereod === 60}
					clickHandler={this.clickHandler.bind(this)} />
					<TimeButton
					val='3Y'
					timePereod={36}
					selected={this.props.timePereod === 36}
					clickHandler={this.clickHandler.bind(this)} />
					<TimeButton
					val='1Y'
					timePereod={12}
					selected={this.props.timePereod === 12}
					clickHandler={this.clickHandler.bind(this)} />
					<TimeButton
					val='6M'
					timePereod={6}
					selected={this.props.timePereod === 6}
					clickHandler={this.clickHandler.bind(this)} />
					<TimeButton
					val='3M'
					timePereod={3}
					selected={this.props.timePereod === 3}
					clickHandler={this.clickHandler.bind(this)} />
				</form>
			</div>
		);
	}
}

export default TimeForm;
