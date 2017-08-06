import React from 'react';

class Loader extends React.Component {

	render() {
		return (
			<div>
				<div id='screen'></div>
					<div id='loading-container'>
						<h5>Loading...</h5>
					</div>
			</div>
		)
	}
}

export default Loader;