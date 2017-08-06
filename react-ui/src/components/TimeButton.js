import React from 'react';

class TimeButton extends React.Component {

	clickHandler(e) {
		this.props.clickHandler(e.target.id.substr(1));
	}

	render() {
		if (this.props.selected) {
			return (
				<div className='time-btn selected-time' id={'time' + this.props.timePereod} >
					<a
					id={'a' + this.props.timePereod}
					onClick={this.clickHandler.bind(this)}>
					{this.props.val}</a>
				</div>
				)
		} else {
			return (
				<div className='time-btn' id={'time' + this.props.timePereod} >
					<a
					id={'a' + this.props.timePereod}
					onClick={this.clickHandler.bind(this)}>
					{this.props.val}</a>
				</div>	
				)
		}
	}
}

export default TimeButton;