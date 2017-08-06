import React from 'react';

class Controlls extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			input: ''
		}
	}
	removeStock(e) {
		this.props.removeStock(e.target.id, true);
	}

	handleChange(e) {
		this.setState({ input: e.target.value })
	}

	handleSubmit(e) {
		e.preventDefault();
		this.props.addStock(this.state.input, true);
		this.setState({ input: '' });
	}

	messageExists() {
		return this.props.message !== '';
	}

	render() {

		return (
			<div id='controlls'>
				<form onSubmit={this.handleSubmit.bind(this)} autocomplete="off">
					<label>Search for a stock to add: </label>
					<input
					autocomplete="off"
					type="text"
					placeholder="Stock Code..."
					id='search-input'
					value={this.state.input}
					onChange={this.handleChange.bind(this)}/>
				</form>
				{this.messageExists() && <p id='message'>{this.props.message}</p>}
				<ul id='stock-list'>
					{
						Object.keys(this.props.data).map( (stock) => {
							return (
								<a
								onClick={this.removeStock.bind(this)}
								key={stock}>
									<li
									id={stock}
									className='stock'
									>{stock}
									</li>
								</a>
								);
						})
					}
				</ul>
				<p id='note'>For Australian stocks, add .AX after the code.</p> 
			</div>
		);
	}
}

export default Controlls;
