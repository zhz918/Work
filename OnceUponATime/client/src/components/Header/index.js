import React from 'react';
import './styles.css';

class Header extends React.Component {
    render() {
        return (
            <div className='header'>
                <h3>{this.props.title}</h3>
            </div>
        )
    }
}

export default Header;
