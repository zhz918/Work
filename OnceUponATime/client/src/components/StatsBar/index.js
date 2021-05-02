import React from 'react';
import './styles.css';
import followupsIcon from '../images/followups-icon.png';
import contributorsIcon from '../images/contributors-icon.png';
import likesIcon from '../images/likes-icon.png';



export default class StatsBar extends React.Component {

    render() {
        return (
            <div className='statsBar'>
                <img src={followupsIcon} alt='' />
                {this.props.followups}
                <img src={contributorsIcon} alt='' />
                {this.props.contributors}
                <img src={likesIcon} alt='' />
                {this.props.likes}
            </div>
        )
    }
}